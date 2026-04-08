export default function PrimaryButton({ label, onClick, type = "button" }) {
  return (
    <button type={type} className="primary-button" onClick={onClick}>
      {label}
    </button>
  );
}
