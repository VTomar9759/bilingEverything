import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import {
  Spin,
  Table,
  Tag,
  Button,
  Skeleton,
  message,
  Empty,
  Typography,
  Divider,
} from 'antd';
import {
  CrownOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import useOrgData from '../../../hooks/useOrgData';
import { updateSubscription } from '../../../store/slices/authSlices';
import {
  createSubscriptionOrder,
  verifySubscriptionPayment,
  getOrgSubscription,
  cancelPendingSubscription,
} from '../../../../services/paymentService';
import { fetchSubscriptionPlans } from '../../../subscription/subscription-plan';

const { Title, Text } = Typography;

/* ─── Helpers ─────────────────────────────────────────────────────── */

const loadRazorpayScript = () => {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = resolve;
    document.body.appendChild(s);
  });
};

const statusColor = (status) => {
  switch (status) {
    case 'active':    return 'green';
    case 'expired':   return 'red';
    case 'pending':   return 'orange';
    case 'replaced':  return 'blue';
    case 'cancelled': return 'default';
    case 'failed':    return 'volcano';
    default:          return 'default';
  }
};

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

const fmtCurrency = (amount, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount ?? 0);

/* ─── Component ───────────────────────────────────────────────────── */

const MyPlanes = () => {
  const dispatch = useDispatch();
  const { user_subscription } = useOrgData();

  const [subscriptionData, setSubscriptionData] = useState(null);
  const [history, setHistory] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loadingSub, setLoadingSub] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [payingPlanId, setPayingPlanId] = useState(null);

  /* ── Fetch current subscription + history ── */
  const loadSubscription = useCallback(async () => {
    try {
      setLoadingSub(true);
      const data = await getOrgSubscription(true);
      setSubscriptionData(data?.subscription ?? null);
      setHistory(Array.isArray(data?.history) ? data.history : []);
    } catch (err) {
      console.error('MyPlanes – loadSubscription error:', err);
      setSubscriptionData(user_subscription?.subscription ?? null);
    } finally {
      setLoadingSub(false);
    }
  }, [user_subscription]);

  /* ── Fetch plan catalogue ── */
  const loadPlans = useCallback(async () => {
    try {
      setLoadingPlans(true);
      const data = await fetchSubscriptionPlans();
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('MyPlanes – loadPlans error:', err);
    } finally {
      setLoadingPlans(false);
    }
  }, []);

  useEffect(() => {
    loadSubscription();
    loadPlans();
  }, [loadSubscription, loadPlans]);

  /* ── Razorpay checkout flow ── */
  const handleSubscribe = async (plan) => {
    if (payingPlanId) return;

    setPayingPlanId(plan.id);
    let subscription_id = null;

    try {
      const orderData = await createSubscriptionOrder(plan.id);

      // Handle Free Trial (activated without Razorpay checkout)
      if (orderData.is_free_trial) {
        if (orderData.subscription) {
          dispatch(updateSubscription(orderData.subscription));
        }
        message.success(`🎉 Free trial for ${plan.plan_name} activated successfully!`);
        await loadSubscription();
        return;
      }

      const { order_id, amount, currency, key_id } = orderData;
      subscription_id = orderData.subscription_id;

      await loadRazorpayScript();

      await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: key_id,
          amount,
          currency,
          name: 'Bill Everything',
          description: plan.plan_name,
          order_id,
          handler: async (response) => {
            try {
              const result = await verifySubscriptionPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                subscription_id,
              });
              if (result?.subscription) {
                dispatch(updateSubscription(result.subscription));
              }
              message.success(`🎉 Subscribed to ${plan.plan_name} successfully!`);
              await loadSubscription();
              resolve();
            } catch (err) {
              message.error(err.message || 'Payment verification failed.');
              reject(err);
            }
          },
          modal: {
            ondismiss: async () => {
              if (subscription_id) {
                try {
                  await cancelPendingSubscription(subscription_id);
                } catch (_) {
                  // best-effort
                }
              }
              setPayingPlanId(null);
              resolve();
            },
          },
          theme: { color: '#01514b' },
        });
        rzp.open();
      });
    } catch (err) {
      message.error(err.message || 'Failed to initiate payment. Please try again.');
    } finally {
      setPayingPlanId(null);
    }
  };

  /* ── History table columns ── */
  const historyColumns = [
    {
      title: 'Plan',
      key: 'plan_name',
      render: (_, row) => row?.plan?.plan_name ?? row?.plan_name ?? '—',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (v, row) => fmtCurrency(v, row?.currency),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (v) => <Tag color={statusColor(v)}>{(v ?? '—').toUpperCase()}</Tag>,
    },
    {
      title: 'Start',
      dataIndex: 'start_date',
      key: 'start_date',
      render: fmtDate,
    },
    {
      title: 'Expiry',
      dataIndex: 'end_date',
      key: 'end_date',
      render: fmtDate,
    },
    {
      title: 'Activated',
      dataIndex: 'activated_at',
      key: 'activated_at',
      render: fmtDate,
    },
  ];

  const activeSub = subscriptionData;
  const isActive  = activeSub?.is_active || activeSub?.status === 'active';

  return (
    <PageContainer>
      {/* ── Header ── */}
      <SectionHeader>
        <HeaderIcon>
          <CrownOutlined />
        </HeaderIcon>
        <div>
          <Title level={4} style={{ margin: 0, color: 'var(--color-text-primary, #111827)' }}>
            My Subscription Plan
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Manage your active plan and billing history
          </Text>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <Button
            icon={<ReloadOutlined />}
            size="small"
            onClick={loadSubscription}
            loading={loadingSub}
          >
            Refresh
          </Button>
        </div>
      </SectionHeader>

      <Divider style={{ margin: '14px 0' }} />

      {/* ── Active Plan Card ── */}
      {loadingSub ? (
        <Skeleton active paragraph={{ rows: 3 }} style={{ marginBottom: 24 }} />
      ) : activeSub ? (
        <ActivePlanCard>
          <CardRow>
            <div>
              <PlanNameLabel>Current Plan</PlanNameLabel>
              <PlanNameValue>
                {activeSub.plan_name ?? activeSub?.plan?.plan_name ?? '—'}
              </PlanNameValue>
            </div>
            <Tag
              color={statusColor(activeSub.status)}
              style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20 }}
            >
              {(activeSub.status ?? 'unknown').toUpperCase()}
            </Tag>
          </CardRow>
          <MetaRow>
            <MetaItem>
              <CalendarOutlined style={{ color: '#01514b', marginRight: 6 }} />
              <span>
                <strong>Start:</strong> {fmtDate(activeSub.start_date)}
              </span>
            </MetaItem>
            <MetaItem>
              <CalendarOutlined style={{ color: '#e11d48', marginRight: 6 }} />
              <span>
                <strong>Expires:</strong>{' '}
                {fmtDate(activeSub.end_date ?? activeSub.expiry_date)}
              </span>
            </MetaItem>
            {activeSub.amount != null && (
              <MetaItem>
                <span>
                  <strong>Paid:</strong>{' '}
                  {fmtCurrency(activeSub.amount, activeSub.currency)}
                </span>
              </MetaItem>
            )}
            {isActive && (
              <MetaItem>
                <CheckCircleOutlined style={{ color: '#16a34a', marginRight: 6 }} />
                <span style={{ color: '#16a34a', fontWeight: 600 }}>Active</span>
              </MetaItem>
            )}
          </MetaRow>
        </ActivePlanCard>
      ) : (
        <NoSubCard>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No active subscription found. Choose a plan below."
          />
        </NoSubCard>
      )}

      {/* ── Available Plans ── */}
      <SectionLabel>Available Plans</SectionLabel>

      {loadingPlans ? (
        <PlansGrid>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} active paragraph={{ rows: 4 }} />
          ))}
        </PlansGrid>
      ) : (
        <PlansGrid>
          {plans.map((plan) => {
            const isCurrent =
              isActive &&
              (activeSub?.plan_id === plan.id || activeSub?.plan?.id === plan.id);
            const isLoading = payingPlanId === plan.id;
            const anyPaying = Boolean(payingPlanId);

            return (
              <PlanCard key={plan.id} $popular={plan.popular} $current={isCurrent}>
                {plan.badge && (
                  <PlanBadge $popular={plan.popular}>{plan.badge}</PlanBadge>
                )}
                <PlanName>{plan.plan_name}</PlanName>
                <PlanTagline>{plan.tagline}</PlanTagline>

                <PlanPrice>
                  {plan.price === 0 ? (
                    <span style={{ color: '#16a34a' }}>FREE</span>
                  ) : (
                    <>
                      {fmtCurrency(plan.price)}
                      <PlanDuration> / {plan.durationText}</PlanDuration>
                    </>
                  )}
                </PlanPrice>

                {plan.price > 0 && plan.durationMonths > 1 && (
                  <PlanMonthly>
                    ≈ {fmtCurrency(plan.monthlyEquivalent)} / month
                  </PlanMonthly>
                )}

                <FeatureList>
                  {(plan.features || []).map((f, idx) => (
                    <FeatureItem key={idx}>
                      <CheckCircleOutlined
                        style={{ color: '#01514b', marginRight: 8, flexShrink: 0 }}
                      />
                      {f}
                    </FeatureItem>
                  ))}
                </FeatureList>

                <Button
                  type={isCurrent ? 'default' : 'primary'}
                  block
                  disabled={isCurrent || anyPaying}
                  loading={isLoading}
                  onClick={() => handleSubscribe(plan)}
                  style={
                    !isCurrent
                      ? {
                          marginTop: 16,
                          background: '#01514b',
                          borderColor: '#01514b',
                          fontWeight: 600,
                          borderRadius: 10,
                          height: 42,
                        }
                      : { marginTop: 16, borderRadius: 10, height: 42 }
                  }
                >
                  {isCurrent
                    ? '✓ Current Plan'
                    : plan.is_free_trial
                    ? 'Start Free Trial'
                    : plan.buttonText || 'Subscribe'}
                </Button>
              </PlanCard>
            );
          })}
        </PlansGrid>
      )}

      {/* ── History Table ── */}
      {history.length > 0 && (
        <>
          <SectionLabel style={{ marginTop: 28 }}>Subscription History</SectionLabel>
          <Table
            dataSource={history}
            columns={historyColumns}
            rowKey="id"
            size="small"
            pagination={false}
            scroll={{ x: 600 }}
            style={{ borderRadius: 10, overflow: 'hidden' }}
          />
        </>
      )}
    </PageContainer>
  );
};

export default MyPlanes;

/* ─── Styled Components ─────────────────────────────────────────── */

const PageContainer = styled.div`
  padding: 4px 0;
  font-family: 'Inter', 'Segoe UI', sans-serif;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const HeaderIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(1, 81, 75, 0.1) 0%, rgba(1, 81, 75, 0.18) 100%);
  color: #01514b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
`;

const ActivePlanCard = styled.div`
  background: linear-gradient(135deg, rgba(1, 81, 75, 0.04) 0%, rgba(1, 81, 75, 0.09) 100%);
  border: 1px solid rgba(1, 81, 75, 0.2);
  border-radius: 12px;
  padding: 18px 20px;
  margin-bottom: 24px;
`;

const CardRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
`;

const PlanNameLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
  margin-bottom: 2px;
`;

const PlanNameValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #01514b;
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
`;

const MetaItem = styled.div`
  font-size: 13px;
  color: var(--color-text-secondary, #4b5563);
  display: flex;
  align-items: center;
`;

const NoSubCard = styled.div`
  border: 1px dashed #d1d5db;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 24px;
  text-align: center;
  background: var(--color-bg, #f9fafb);
`;

const SectionLabel = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-secondary, #4b5563);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 14px;
`;

const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 8px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const PlanCard = styled.div`
  background: ${({ $current }) =>
    $current
      ? 'linear-gradient(135deg, rgba(1,81,75,0.07) 0%, rgba(1,81,75,0.12) 100%)'
      : 'var(--color-surface, #fff)'};
  border: ${({ $current, $popular }) =>
    $current
      ? '2px solid #01514b'
      : $popular
      ? '2px solid rgba(1,81,75,0.4)'
      : '1px solid var(--color-border, #e5e7eb)'};
  border-radius: 12px;
  padding: 18px 14px;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 18px rgba(1, 81, 75, 0.1);
  }
`;

const PlanBadge = styled.div`
  display: inline-block;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.08em;
  padding: 2px 10px;
  border-radius: 999px;
  background: ${({ $popular }) => ($popular ? '#01514b' : '#e6f7f5')};
  color: ${({ $popular }) => ($popular ? '#fff' : '#01514b')};
  margin-bottom: 10px;
  align-self: flex-start;
`;

const PlanName = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary, #111827);
  margin-bottom: 4px;
`;

const PlanTagline = styled.div`
  font-size: 11.5px;
  color: #6b7280;
  margin-bottom: 12px;
  line-height: 1.4;
`;

const PlanPrice = styled.div`
  font-size: 24px;
  font-weight: 800;
  color: var(--color-text-primary, #111827);
  letter-spacing: -0.03em;
`;

const PlanDuration = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  letter-spacing: 0;
`;

const PlanMonthly = styled.div`
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
  margin-bottom: 10px;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 10px 0 0 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 7px;
`;

const FeatureItem = styled.li`
  font-size: 11.5px;
  color: var(--color-text-secondary, #4b5563);
  display: flex;
  align-items: flex-start;
  line-height: 1.4;
`;
