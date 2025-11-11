class InvestmentCalculator {
  constructor() {
    this.config = {
      conservative: { min: 5, max: 8, current: 6 },
      balanced: { min: 10, max: 15, current: 12 },
      aggressive: { min: 15, max: 25, current: 18 },
    };

    this.currentStrategy = "balanced";
    this.elements = this.initializeElements();
    this.setupEventListeners();
    this.init();
  }

  initializeElements() {
    const elements = {};
    const ids = [
      "initialAmount",
      "amountRange",
      "amountValue",
      "investmentYears",
      "yearsRange",
      "yearsValue",
      "annualReturn",
      "returnRange",
      "returnValue",
      "finalAmount",
      "totalProfit",
      "growthPercent",
      "monthlyGrowth",
      "yearlyGrowth",
      "totalReturn",
      "chartLabels",
      "yearsDisplay",
      "lineChart",
      "chartTooltip",
    ];

    ids.forEach((id) => {
      elements[id] = document.getElementById(id);
    });

    return elements;
  }

  setupEventListeners() {
    ["input", "change"].forEach((event) => {
      this.elements.initialAmount.addEventListener(event, () =>
        this.handleAmountInput()
      );
      this.elements.investmentYears.addEventListener(event, () =>
        this.handleYearsInput()
      );
      this.elements.annualReturn.addEventListener(event, () =>
        this.handleReturnInput()
      );
    });

    this.elements.amountRange.addEventListener("input", () =>
      this.handleAmountRange()
    );
    this.elements.yearsRange.addEventListener("input", () =>
      this.handleYearsRange()
    );
    this.elements.returnRange.addEventListener("input", () =>
      this.handleReturnRange()
    );

    document.querySelectorAll(".control-item").forEach((item) => {
      item.addEventListener("click", (e) => this.handleStrategyChange(e));
    });
  }

  init() {
    this.updateCalculation();
  }

  handleAmountInput() {
    const value = this.formatCurrency(this.elements.initialAmount.value);
    this.elements.amountValue.textContent = value;
    this.elements.amountRange.value = this.elements.initialAmount.value;
    this.updateCalculation();
  }

  handleAmountRange() {
    this.elements.initialAmount.value = this.elements.amountRange.value;
    this.handleAmountInput();
  }

  handleYearsInput() {
    const years = this.elements.investmentYears.value;
    this.elements.yearsValue.textContent = `${years} ${this.getYearWord(
      years
    )}`;
    this.elements.yearsRange.value = years;
    this.elements.yearsDisplay.textContent = `${years} ${this.getYearWord(
      years
    )}`;
    this.updateCalculation();
  }

  handleYearsRange() {
    this.elements.investmentYears.value = this.elements.yearsRange.value;
    this.handleYearsInput();
  }

  handleReturnInput() {
    this.elements.returnValue.textContent = `${this.elements.annualReturn.value}%`;
    this.elements.returnRange.value = this.elements.annualReturn.value;
    this.updateCalculation();
  }

  handleReturnRange() {
    this.elements.annualReturn.value = this.elements.returnRange.value;
    this.handleReturnInput();
  }

  handleStrategyChange(event) {
    const strategy = event.currentTarget.dataset.type;
    this.currentStrategy = strategy;

    document.querySelectorAll(".control-item").forEach((item) => {
      item.classList.remove("active");
    });
    event.currentTarget.classList.add("active");

    const config = this.config[strategy];
    this.elements.annualReturn.value = config.current;
    this.elements.returnRange.value = config.current;
    this.handleReturnInput();
  }

  updateCalculation() {
    const initialAmount = parseFloat(this.elements.initialAmount.value);
    const years = parseFloat(this.elements.investmentYears.value);
    const annualReturn = parseFloat(this.elements.annualReturn.value) / 100;

    const finalAmount = this.calculateCompoundInterest(
      initialAmount,
      annualReturn,
      years
    );
    const totalProfit = finalAmount - initialAmount;
    const growthPercent = (totalProfit / initialAmount) * 100;

    this.elements.finalAmount.textContent = this.formatCurrency(finalAmount);
    this.elements.totalProfit.textContent = this.formatCurrency(totalProfit);
    this.elements.growthPercent.textContent = `${growthPercent.toFixed(1)}%`;

    this.updateStatistics(initialAmount, finalAmount, years, totalProfit);
    this.updateChart(initialAmount, annualReturn, years);
  }

  calculateCompoundInterest(principal, rate, years) {
    return principal * Math.pow(1 + rate, years);
  }

  updateStatistics(initial, final, years, profit) {
    const monthlyGrowth = profit / (years * 12);
    const yearlyGrowth = profit / years;
    const totalReturn = (profit / initial) * 100;

    this.elements.monthlyGrowth.textContent =
      this.formatCurrency(monthlyGrowth);
    this.elements.yearlyGrowth.textContent = this.formatCurrency(yearlyGrowth);
    this.elements.totalReturn.textContent = `${totalReturn.toFixed(1)}%`;
  }

  updateChart(initialAmount, annualReturn, years) {
    const data = this.generateChartData(initialAmount, annualReturn, years);
    this.renderLineChart(data);
  }

  generateChartData(initialAmount, annualReturn, years) {
    const dataPoints = [{ year: 0, amount: initialAmount }];
    let currentAmount = initialAmount;

    for (let i = 1; i <= years; i++) {
      currentAmount = this.calculateCompoundInterest(
        initialAmount,
        annualReturn,
        i
      );
      dataPoints.push({ year: i, amount: currentAmount });
    }

    return {
      dataPoints,
      maxAmount: Math.max(...dataPoints.map((p) => p.amount)),
    };
  }

  renderLineChart(data) {
    const svg = this.elements.lineChart;
    const width = svg.clientWidth;
    const height = svg.clientHeight;
    const padding = 40;

    svg.innerHTML = "";
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

    const xScale = (year) =>
      padding +
      (year / data.dataPoints[data.dataPoints.length - 1].year) *
        (width - 2 * padding);
    const yScale = (amount) =>
      height - padding - (amount / data.maxAmount) * (height - 2 * padding);

    // Create area
    let areaPath = `M ${xScale(0)} ${yScale(data.dataPoints[0].amount)}`;
    data.dataPoints.forEach((point) => {
      areaPath += ` L ${xScale(point.year)} ${yScale(point.amount)}`;
    });
    areaPath += ` L ${xScale(
      data.dataPoints[data.dataPoints.length - 1].year
    )} ${height - padding}`;
    areaPath += ` L ${xScale(0)} ${height - padding} Z`;

    const area = document.createElementNS("http://www.w3.org/2000/svg", "path");
    area.setAttribute("d", areaPath);
    area.setAttribute("class", "chart-area");
    svg.appendChild(area);

    // Create line
    let linePath = `M ${xScale(data.dataPoints[0].year)} ${yScale(
      data.dataPoints[0].amount
    )}`;
    data.dataPoints.slice(1).forEach((point) => {
      linePath += ` L ${xScale(point.year)} ${yScale(point.amount)}`;
    });

    const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
    line.setAttribute("d", linePath);
    line.setAttribute("class", "chart-line");
    svg.appendChild(line);

    // Create points
    data.dataPoints.forEach((point) => {
      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      circle.setAttribute("cx", xScale(point.year));
      circle.setAttribute("cy", yScale(point.amount));
      circle.setAttribute("r", "4");
      circle.setAttribute("class", "chart-point");
      circle.setAttribute("data-year", point.year);
      circle.setAttribute("data-amount", point.amount);

      circle.addEventListener("mouseover", (e) => this.showTooltip(e, point));
      circle.addEventListener("mouseout", () => this.hideTooltip());

      svg.appendChild(circle);
    });
  }

  showTooltip(event, point) {
    const tooltip = this.elements.chartTooltip;
    tooltip.innerHTML = `
            <div><strong>${
              point.year === 0 ? "Начало" : `${point.year} год`
            }</strong></div>
            <div>${this.formatCurrency(point.amount)}</div>
        `;
    tooltip.style.left = `${event.pageX + 10}px`;
    tooltip.style.top = `${event.pageY - 10}px`;
    tooltip.classList.add("visible");
  }

  hideTooltip() {
    this.elements.chartTooltip.classList.remove("visible");
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  getYearWord(years) {
    const lastDigit = years % 10;
    if (lastDigit === 1 && years !== 11) return "год";
    if (lastDigit >= 2 && lastDigit <= 4 && (years < 10 || years > 20))
      return "года";
    return "лет";
  }
}
