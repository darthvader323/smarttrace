import React, { useState, useEffect } from "react";
import api from "../api/axios";
import "../styles/FeaturePages.css";

function GenerateBatch() {

  const [productId, setProductId] = useState("");
  const [totalUnits, setTotalUnits] = useState("");
  const [unitsPerCarton, setUnitsPerCarton] = useState("");
  const [cartonsPerPallet, setCartonsPerPallet] = useState("");

  const [result, setResult] = useState(null);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {

    try {

      const res = await api.get("products/");
      setProducts(res.data);

    } catch (err) {

      console.error(err);
      setError("Failed to fetch products");
    }
  };

  const handleGenerate = async () => {

    setError("");
    setResult(null);

    // Frontend validation
    if (!productId) {
      setError("Please select a product");
      return;
    }

    const totalUnitsNumber = parseInt(totalUnits, 10);
    const unitsPerCartonNumber = parseInt(unitsPerCarton, 10);
    const cartonsPerPalletNumber = parseInt(cartonsPerPallet, 10);

    if (!totalUnits || Number.isNaN(totalUnitsNumber) || totalUnitsNumber <= 0) {
      setError("Please enter a valid total units value");
      return;
    }

    if (!unitsPerCarton || Number.isNaN(unitsPerCartonNumber) || unitsPerCartonNumber <= 0) {
      setError("Please enter a valid units per carton value");
      return;
    }

    if (!cartonsPerPallet || Number.isNaN(cartonsPerPalletNumber) || cartonsPerPalletNumber <= 0) {
      setError("Please enter a valid cartons per pallet value");
      return;
    }

    try {

      const response = await api.post("generate-batch/", {
        product_id: productId,
        total_units: totalUnitsNumber,
        units_per_carton: unitsPerCartonNumber,
        cartons_per_pallet: cartonsPerPalletNumber,
      });

      setResult(response.data.summary);

    } catch (error) {

      setError(
        error.response?.data?.error || "Error generating batch"
      );

      console.error(error);
    }
  };

  return (

    <div className="feature-page">

      <div className="feature-header">
        <h1>Generate Batch</h1>
        <p>Create product serials in carton and pallet hierarchy.</p>
      </div>

      <div className="feature-panel">

        <div className="feature-form">

          <select
            className="feature-select"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            <option value="">Select Product</option>

            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.product_code})
              </option>
            ))}
          </select>

          <input
            className="feature-input"
            type="number"
            placeholder="Total Units"
            value={totalUnits}
            onChange={(e) => setTotalUnits(e.target.value)}
          />

          <input
            className="feature-input"
            type="number"
            placeholder="Units Per Carton"
            value={unitsPerCarton}
            onChange={(e) => setUnitsPerCarton(e.target.value)}
          />

          <input
            className="feature-input"
            type="number"
            placeholder="Cartons Per Pallet"
            value={cartonsPerPallet}
            onChange={(e) => setCartonsPerPallet(e.target.value)}
          />

          <button
            className="primary-action"
            onClick={handleGenerate}
          >
            Generate Batch
          </button>

        </div>

        {error && (
          <p className="alert error">
            {error}
          </p>
        )}

        {result && (
          <div className="result-panel">

            <h3>Batch Summary</h3>

            <div className="summary-grid">

              <div className="summary-item">
                <span>Units</span>
                <strong>{result.units}</strong>
              </div>

              <div className="summary-item">
                <span>Cartons</span>
                <strong>{result.cartons}</strong>
              </div>

              <div className="summary-item">
                <span>Pallets</span>
                <strong>{result.pallets}</strong>
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}

export default GenerateBatch;
