// src/services/ProductService.js
export const fetchProducts = async () => {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/jubaidasumaiya/products/refs/heads/main/Products%20-%20Complexbd%20(1).csv"  
       );

    if (!response.ok) {
      throw new Error("Network error: Unable to fetch CSV");
    }

    const csvText = await response.text();

    // CSV কে object array তে convert করা
    const rows = csvText.trim().split("\n");
    const headers = rows[0].split(",").map(h => h.trim());
    
    const products = rows.slice(1).map((row, index) => {
      const values = row.split(",");
      const product = {};
      headers.forEach((h, i) => {
        product[h] = values[i] ? values[i].trim() : "";
      });
      // যদি SKU বা id না থাকে, index দিয়ে temporary key দাও
      if (!product["SKU"]) product["SKU"] = index;
      return product;
    });

    return products;
  } catch (error) {
    console.error("Error fetching CSV:", error);
    throw error;
  }
};