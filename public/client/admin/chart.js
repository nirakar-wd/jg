document.addEventListener("DOMContentLoaded", () => {
  const chartContainer = document.getElementById("myChart");

  // Function to create the chart
  const createChart = (ctx, months, salesData) => {
    new Chart(ctx, {
      type: "line",
      data: {
        labels: months, // Use month labels from the response
        datasets: [
          {
            label: "Sales chart #",
            data: salesData, // Use the sales data from the response
            borderWidth: 1,
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            tension: 0.1, // Make the line smoother
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Sales",
            },
          },
          x: {
            title: {
              display: true,
              text: "Months",
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: "top",
          },
          tooltip: {
            enabled: true,
          },
        },
        responsive: true,
      },
    });
  };

  // Fetch the sales data and create the chart
  const fetchSalesData = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/orders/sales");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data.salesData && data.months) {
        createChart(chartContainer, data.months, data.salesData);
      } else {
        console.error("Invalid data format received:", data);
      }
    } catch (error) {
      console.error("Error fetching sales data:", error);
      alert("Failed to load sales data. Please try again later.");
    }
  };

  // Call the function to fetch data and render the chart
  fetchSalesData();
});
