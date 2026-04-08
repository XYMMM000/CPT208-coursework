export default function Container({ className = "", children }) {
  const classes = ["container", className].filter(Boolean).join(" ");
  return <div className={classes}>{children}</div>;
}
