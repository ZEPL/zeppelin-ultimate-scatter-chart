import Visualization from 'zeppelin-vis'
import AdvancedTransformation from 'zeppelin-tabledata/advanced-transformation'

import Highcharts from 'highcharts/highcharts'
require('highcharts/highcharts-more.js')(Highcharts)
require('highcharts/modules/data')(Highcharts)
require('highcharts/modules/exporting')(Highcharts)

import { CommonParameter, createScatterChartDataStructure, createScatterChartOption, } from './chart/scatter'
import { BubbleParameter, createBubbleChartDataStructure, createBubbleChartOption, } from './chart/bubble'

export default class Chart extends Visualization {
  constructor(targetEl, config) {
    super(targetEl, config)

    const spec = {
      charts: {
        'scatter': {
          transform: { method: 'array', },
          sharedAxis: false,
          axis: {
            'xAxis': { dimension: 'single', axisType: 'key', minAxisCount: 1, description: 'serial', },
            'yAxis': { dimension: 'multiple', axisType: 'aggregator', minAxisCount: 1, description: 'serial', },
            'category': { dimension: 'multiple', axisType: 'group', },
          },
          parameter: CommonParameter,
        },

        'bubble': {
          transform: { method: 'array:2-key', },
          sharedAxis: false,
          axis: {
            'xAxis': { dimension: 'single', axisType: 'key', minAxisCount: 1, description: 'serial', },
            'yAxis': { dimension: 'single', axisType: 'key', minAxisCount: 1, description: 'serial', },
            'zAxis': { dimension: 'multiple', axisType: 'aggregator', minAxisCount: 1, },
            'category': { dimension: 'multiple', axisType: 'group', },
          },
          parameter: BubbleParameter,
        },
      },
    }

    this.transformation = new AdvancedTransformation(config, spec)
  }

  getChartElementId() {
    return this.targetEl[0].id
  }

  getChartElement() {
    return document.getElementById(this.getChartElementId())
  }

  clearChart() {
    if (this.chartInstance) { this.chartInstance.destroy() }
  }

  hideChart() {
    this.clearChart()
    this.getChartElement().innerHTML = `
        <div style="margin-top: 60px; text-align: center; font-weight: 100">
            <span style="font-size:30px;">
                Please set axes in
            </span>
            <span style="font-size: 30px; font-style:italic;">
                Settings
            </span>
        </div>`
  }

  showError(error) {
    this.clearChart()
    this.getChartElement().innerHTML = `
        <div style="margin-top: 60px; text-align: center; font-weight: 300">
            <span style="font-size:30px; color: #e4573c;">
                ${error.message} 
            </span>
        </div>`
  }

  drawScatterChart(parameter, column, transformer) {
    if (column.aggregator.length === 0 || column.key.length === 0) {
      this.hideChart()
      return /** have nothing to display, if aggregator is not specified at all */
    }

    const { rows, keyNames, selectors, } = transformer()

    const data = createScatterChartDataStructure(rows, keyNames, selectors, parameter)
    const chartOption = createScatterChartOption(Highcharts, data, parameter, keyNames)

    this.chartInstance = Highcharts.chart(this.getChartElementId(), chartOption)
  }

  drawBubbleChart(parameter, column, transformer) {
    if (column.aggregator.length === 0) {
      this.hideChart()
      return /** have nothing to display, if aggregator is not specified at all */
    }

    const { rows, selectors, } = transformer()

    const data = createBubbleChartDataStructure(rows, selectors)
    const chartOption = createBubbleChartOption(Highcharts, data, parameter)

    this.chartInstance = Highcharts.chart(this.getChartElementId(), chartOption)
  }

  refresh() {
    try {
      this.chartInstance && this.chartInstance.setSize(this.targetEl.width())
    } catch (e) {
      console.warn(e)
    }
  }

  render(data) {
    const {
      chartChanged, parameterChanged,
      chart, parameter, column, transformer,
    } = data

    if (!chartChanged && !parameterChanged) { return }

    try {
      if (chart === 'scatter') {
        this.drawScatterChart(parameter, column, transformer)
      } else if (chart === 'bubble') {
        this.drawBubbleChart(parameter, column, transformer)
      }
    } catch (error) {
      console.error(error)
      this.showError(error)
    }
  }

  getTransformation() {
    return this.transformation
  }
}


