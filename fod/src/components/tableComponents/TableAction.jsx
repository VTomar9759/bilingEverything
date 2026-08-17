import styled from "styled-components";

const tableActionType = {
  view: "View",
  edit: "Edit",
  delete: "Delete",
};

const TableAction = ({ record, type, onClick }) => {
  const handleView = () => {
    onClick(record, tableActionType.view);
  };

  const handleEdit = () => {
    onClick(record, tableActionType.edit);
  };

  const handleDelete = () => {
    onClick(record, tableActionType.delete);
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {type?.view && <ViewText onClick={handleView}>View</ViewText>}
        {type?.edit && (
          <>
            <Separator>|</Separator>
            <EditText onClick={handleEdit}>Edit</EditText>
          </>
        )}

        {type?.delete && (
          <>
            <Separator>|</Separator>
            <DeleteText onClick={handleDelete}>Delete</DeleteText>
          </>
        )}
      </div>
    </>
  );
};

export default TableAction;

const ViewText = styled.span`
  cursor: pointer;
  color: #555;
  text-decoration: underline;

  &:hover {
    color: #1677ff;
  }
`;

const EditText = styled.span`
  cursor: pointer;
  color: #1677ff;
  text-decoration: underline;

  &:hover {
    opacity: 0.8;
  }
`;

const DeleteText = styled.span`
  cursor: pointer;
  color: #ff4d4f;
  text-decoration: underline;

  &:hover {
    opacity: 0.8;
  }
`;

const LoadingCircle = styled.span`
  display: inline-block;
  animation: spin 1s linear infinite;
  color: #ff4d4f;
`;

const Separator = styled.span`
  color: #ccc;
  margin: 0 5px;
`;

// Add global styles for spinning animation
const style = document.createElement("style");
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
