function DonationProgress({ total = 0, meta = 1 }) {
  const porcentaje = Math.min((total / meta) * 100, 100);
  const metaAlcanzada = total >= meta;

  return (
    <div className="bg-white shadow-md rounded-md p-6 w-full max-w-md mx-auto text-center">
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Meta actual:{" "}
        <span className="text-green-600 font-bold">
          {meta.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })}
        </span>
      </h3>

      <div className="w-full h-4 bg-gray-300 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-green-500 transition-all duration-500 ease-out"
          style={{ width: `${porcentaje}%` }}
        ></div>
      </div>

      <p className="text-gray-700">
        Recaudado:{" "}
        <strong className="text-blue-600">
          {total.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })}
        </strong>
      </p>

      {metaAlcanzada && (
        <div className="mt-4 text-green-700 font-semibold text-lg animate-pulse">
          🎉 ¡Meta alcanzada! Gracias por tu ayuda ❤️
        </div>
      )}
    </div>
  );
}

export default DonationProgress;


