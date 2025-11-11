function showMonthlyDetails() {
  console.log("Подробная информация о месячном росте");
}

function showYearlyDetails() {
  console.log("Подробная информация о годовом росте");
}

function showTotalDetails() {
  console.log("Подробная информация о общей доходности");
}

document.addEventListener("DOMContentLoaded", () => {
  new InvestmentCalculator();
});
