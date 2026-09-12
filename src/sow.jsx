"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateCountryCode } from "@/redux/slices/authSlices";

export const useSystemIp = () => {
  const [userIp, setUserIpState] = useState(null);

  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => {
        if (data.ip) {
          setUserIpState(data.ip);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch system IP:", err);
      });
  }, []);

  return userIp;
};


"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Select } from "antd";
import { Country } from "country-state-city";
import { motion, AnimatePresence } from "framer-motion";
import { setUserIp, updateCountryCode } from "@/redux/slices/authSlices";
import { FiGlobe, FiCheck } from "react-icons/fi";
import { useMarketCountry, useSystemIp } from "@/hooks/useMarketCountry";
import { toast } from "react-toastify";

// Format country list into { label, value } array for Ant Design Select options
export const countryListOptions = Country.getAllCountries()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((country) => ({
        label: `${country.name} (${country.isoCode})`,
        value: country.isoCode,
        name: country.name,
        flag: country.flag,
    }));

const ConfirmCountry = ({
    title = "Check Products & Services",
    subtitle = "Select your country to check which products, services, and pricing are available in your region ✦",
}) => {
    const dispatch = useDispatch();
    const userIp = useSelector((state) => state.authSlice?.userIp);
    const countryCode = useSelector((state) => state.authSlice?.countryCode);
    const systemIp = useSystemIp();

    const [open, setOpen] = useState(userIp === systemIp ? true : true);
    const [selectedCountry, setSelectedCountry] = useState(countryCode || "US");

    const handleConfirm = () => {
        if (selectedCountry === useMarketCountry()) {
            dispatch(setUserIp(systemIp));
            dispatch(updateCountryCode(selectedCountry));
            toast.success("Country set successfully");
            setOpen(false);
        } else {
            toast.error("Please select a country");
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                    {/* Dark backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity"
                    />

                    {/* Circular Popup Modal matching reference design */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative z-10 w-[340px] h-[340px] xs:w-[400px] xs:h-[400px] sm:w-[480px] sm:h-[480px] rounded-full bg-gradient-to-br from-[#DCA07A] via-[#CD845D] to-[#BA6E47] shadow-2xl flex flex-col items-center justify-center text-center p-6 xs:p-8 sm:p-12 overflow-hidden border-4 border-white/20 select-none"
                    >
                        {/* Decorative Wavy Ribbon SVG Graphic in Background */}
                        <svg
                            className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
                            viewBox="0 0 500 500"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M-50 250 C 100 100, 250 400, 550 250"
                                stroke="#FCE3CE"
                                strokeWidth="60"
                                strokeLinecap="round"
                                fill="none"
                            />
                            <path
                                d="M-20 380 C 150 200, 300 480, 520 280"
                                stroke="#E08F68"
                                strokeWidth="45"
                                strokeLinecap="round"
                                fill="none"
                            />
                            <path
                                d="M100 -50 C 300 200, 100 400, 400 550"
                                stroke="#FFF0E5"
                                strokeWidth="30"
                                strokeLinecap="round"
                                fill="none"
                            />
                        </svg>


                        {/* Modal Content */}
                        <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-[280px] xs:max-w-[310px] sm:max-w-[340px] space-y-3 sm:space-y-4">
                            {/* Top Badge */}
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/25 backdrop-blur-md text-white text-[10px] xs:text-xs font-semibold tracking-wider uppercase border border-white/30 shadow-xs">
                                <FiGlobe className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
                                <span>LOCATION PREFERENCE</span>
                            </div>

                            {/* Main Title */}
                            <h2 className="text-xl xs:text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm font-serif">
                                {title}
                            </h2>

                            {/* Subtitle */}
                            <p className="text-xs sm:text-sm text-amber-50 font-medium leading-tight max-w-[250px] sm:max-w-[290px] drop-shadow-xs">
                                {subtitle}
                            </p>

                            {/* Ant Design Select Component for Country */}
                            <div className="w-full pt-1">
                                <Select
                                    showSearch
                                    value={selectedCountry}
                                    onChange={(value) => setSelectedCountry(value)}
                                    placeholder="Select country"
                                    optionFilterProp="label"
                                    filterOption={(input, option) =>
                                        (option?.label ?? "").toLowerCase().includes(input.toLowerCase()) ||
                                        (option?.value ?? "").toLowerCase().includes(input.toLowerCase()) ||
                                        (option?.name ?? "").toLowerCase().includes(input.toLowerCase())
                                    }
                                    options={countryListOptions}
                                    popupClassName="confirm-country-select-popup"
                                    dropdownStyle={{ zIndex: 10005 }}
                                    getPopupContainer={() => document.body}
                                    className="w-full text-left country-select-custom"
                                    size="large"
                                    style={{
                                        width: "100%",
                                        textAlign: "left",
                                    }}
                                />
                            </div>

                            {/* Primary Action Button */}
                            <button
                                type="button"
                                onClick={handleConfirm}
                                className="w-full py-2.5 sm:py-3 px-6 rounded-xl sm:rounded-2xl bg-[#A2522B] hover:bg-[#8B421F] text-white font-bold text-sm sm:text-base tracking-wider uppercase shadow-lg shadow-amber-950/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border border-white/20 flex items-center justify-center gap-2"
                            >
                                <span>LET'S GO</span>
                                <FiCheck className="w-4 h-4 stroke-[3]" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
            <style jsx global>{`
        .country-select-custom .ant-select-selector {
          background-color: #ffffff !important;
          border-radius: 12px !important;
          border: 1px solid rgba(255, 255, 255, 0.4) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
          height: 46px !important;
          padding: 0 12px !important;
          display: flex !important;
          align-items: center !important;
        }
        .country-select-custom .ant-select-selection-item {
          font-weight: 600 !important;
          color: #2d2d2d !important;
          font-size: 14px !important;
        }
        .country-select-custom .ant-select-arrow {
          color: #a2522b !important;
        }
        .confirm-country-select-popup.ant-select-dropdown,
        .confirm-country-select-popup {
          z-index: 10005 !important;
          background-color: #ffffff !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25) !important;
          padding: 4px !important;
        }
        .confirm-country-select-popup .ant-select-item {
          border-radius: 8px !important;
          margin: 2px 4px !important;
          font-weight: 500 !important;
          color: #2d2d2d !important;
        }
        .confirm-country-select-popup .ant-select-item-option-selected {
          background-color: #fce3ce !important;
          color: #a2522b !important;
          font-weight: 700 !important;
        }
        .confirm-country-select-popup .ant-select-item-option-active {
          background-color: #fff0e5 !important;
        }
      `}</style>
        </AnimatePresence>
    );
};

export default ConfirmCountry;

