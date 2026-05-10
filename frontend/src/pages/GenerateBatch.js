import React, { useState, useEffect } from "react";
import api from "../api/axios";

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

    if (!totalUnits) {
      setError("Please enter total units");
      return;
    }

    if (!unitsPerCarton) {
      setError("Please enter units per carton");
      return;
    }

    if (!cartonsPerPallet) {
      setError("Please enter cartons per pallet");
      return;
    }

    try {

      const response = await api.post("generate-batch/", {
        product_id: productId,
        total_units: totalUnits,
        units_per_carton: unitsPerCarton,
        cartons_per_pallet: cartonsPerPallet,
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

    <div className="card">

      <h2>Generate Product Batch</h2>

      <select
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
        type="number"
        placeholder="Total Units"
        value={totalUnits}
        onChange={(e) => setTotalUnits(e.target.value)}
      />

      <input
        type="number"
        placeholder="Units Per Carton"
        value={unitsPerCarton}
        onChange={(e) => setUnitsPerCarton(e.target.value)}
      />

      <input
        type="number"
        placeholder="Cartons Per Pallet"
        value={cartonsPerPallet}
        onChange={(e) => setCartonsPerPallet(e.target.value)}
      />

      <button className="action" onClick={handleGenerate}>
        Generate Batch
      </button>

      {error && (
        <p
          style={{
            color: "red",
            marginTop: "10px"
          }}
        >
          {error}
        </p>
      )}

      {result && (
        <div style={{ marginTop: "20px" }}>

          <h3>Batch Summary</h3>

          <p>Units: {result.units}</p>
          <p>Cartons: {result.cartons}</p>
          <p>Pallets: {result.pallets}</p>

        </div>
      )}

    </div>
  );
}

export default GenerateBatch;