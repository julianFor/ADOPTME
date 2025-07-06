import "../styles/DonationProgress.css";

function DonationProgress({ total = 0, meta = 1 }) {
  const porcentaje = Math.min((total / meta) * 100, 100);

  return (
    <div className="donation-progress">
      <h3>
        Meta actual:{" "}
        <span>
          {meta.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })}
        </span>
      </h3>

      <div className="progress-bar">
        <div
          className="filled"
          style={{ width: `${porcentaje}%` }}
        ></div>
      </div>

      <p>
        Recaudado:{" "}
        <strong>
          {total.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })}
        </strong>
      </p>
    </div>
  );
}

export default DonationProgress;
