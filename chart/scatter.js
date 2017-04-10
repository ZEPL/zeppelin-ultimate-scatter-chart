export const CommonParameter = {
  'usePredefinedColorSet': { valueType: 'boolean', defaultValue: true, description: 'use predefined color set', widget: 'checkbox', },
  'markerRadius': { valueType: 'int', defaultValue: 3, description: 'radius size of markers', },
  'floatingLegend': { valueType: 'string', defaultValue: 'default', description: 'floating legend', widget: 'option', optionValues: [ 'default', 'top-right', 'top-left', ], },
  'rotateXAxisLabel': { valueType: 'int', defaultValue: 0, description: 'rotate xAxis labels', },
  'rotateYAxisLabel': { valueType: 'int', defaultValue: 0, description: 'rotate yAxis labels', },
  'tooltipPrecision': { valueType: 'string', defaultValue: '.1f', description: 'precision of tooltip format without <code>:</code> (<a href="http://www.highcharts.com/docs/chart-concepts/labels-and-string-formatting">doc</a>)', },
  'legendLabelFormat': { valueType: 'string', defaultValue: '', description: 'text format of legend (<a href="http://www.highcharts.com/docs/chart-concepts/labels-and-string-formatting">doc</a>)', },
  'xAxisPosition': { valueType: 'string', defaultValue: 'bottom', description: 'xAxis position', widget: 'option', optionValues: [ 'bottom', 'top', ], },
  'yAxisPosition': { valueType: 'string', defaultValue: 'left', description: 'yAxis position', widget: 'option', optionValues: [ 'left', 'right', ], },
  'showLegend': { valueType: 'boolean', defaultValue: true, description: 'show legend', widget: 'checkbox', },
  'legendPosition': { valueType: 'string', defaultValue: 'bottom', description: 'position of legend', widget: 'option', optionValues: [ 'bottom', 'top', ], },
  'legendLayout': { valueType: 'string', defaultValue: 'horizontal', description: 'layout of legend', widget: 'option', optionValues: [ 'horizontal', 'vertical', ], },
  'zoomType': { valueType: 'string', defaultValue: 'xy', description: 'type of zoom', widget: 'option', optionValues: [ 'xy', 'none' ], },
  'subTitle': { valueType: 'string', defaultValue: '', description: 'sub title of chart', },
  'mainTitle': { valueType: 'string', defaultValue: '', description: 'main title of chart', },
  'xAxisUnit': { valueType: 'string', defaultValue: '', description: 'unit of xAxis', },
  'yAxisUnit': { valueType: 'string', defaultValue: '', description: 'unit of yAxis', },
  'xAxisName': { valueType: 'string', defaultValue: '', description: 'name of xAxis', },
  'yAxisName': { valueType: 'string', defaultValue: '', description: 'name of yAxis', },
}

const PredefinedColorSets = [
  'rgba(0, 77, 255, 0.5)',
  'rgba(255, 51, 0, 0.5)',
  'rgba(179, 0, 255, 0.5)',
  'rgba(102, 102, 102, 0.5)',
  'rgba(51, 255, 102, 0.5)',
  'rgba(179, 0, 255, 0.5)',
  'rgba(51, 204, 255, 0.5)',
  'rgba(255, 102, 51, 0.5)',
  'rgba(204, 255, 51, 0.5)',
  'rgba(245, 61, 0, 0.5)',
  'rgba(102, 51, 255, 0.5)',
  'rgba(51, 255, 204, 0.5)',
  'rgba(255, 255, 51, 0.9)', /** yellow */
  'rgba(0, 184, 245, 0.5)',
  'rgba(0, 138, 184, 0.5)',
  'rgba(51, 102, 255, 0.5)',
  'rgba(255, 51, 204, 0.5)',
  'rgba(51, 255, 102, 0.5)',
  'rgba(184, 46, 0, 0.5)',
  'rgba(204, 51, 255, 0.5)',
  'rgba(255, 51, 102, 0.5)',
  'rgba(102, 255, 51, 0.5)',
  'rgba(255, 204, 51, 0.5)',
]

export function getPrecisionFormat(precision, prefix) {
  return (precision === '') ? `{${prefix}:.1f}` : `{${prefix}:${precision}}`
}

export function createScatterChartDataStructure(rows, keyNames, selectors, parameter) {
  const { usePredefinedColorSet, } = parameter

  const series = []

  const xAxisValues = keyNames.map(kn => {
    let x = null

    try {
      x = parseFloat(kn)
    } catch (error) { /** ignore parsing error, just pushing null */ }

    return x
  })

  for (let i = 0; i < selectors.length; i++) {
    const selector = selectors[i]

    const s = { name: selector, data: [], }
    if (i < PredefinedColorSets.length && usePredefinedColorSet) {
      s.color = PredefinedColorSets[i]
    }

    for(let j = 0; j < xAxisValues.length; j++) {
      const xAxisValue = xAxisValues[j]
      let yAxisValue = rows[i].value[j]

      try {
        if (typeof yAxisValue !== 'number') {
          yAxisValue = parseFloat(yAxisValue)
        }
      } catch (error) {
        yAxisValue = null
        /** ignore parsing error, just put null to indicate */
      }

      if (xAxisValue !== null && yAxisValue !== null) {
        const sRow = [ xAxisValue, yAxisValue, ]
        s.data.push(sRow)
      }
    }

    series.push(s)
  }

  return series
}

export function createScatterChartOption(Highcharts, data, parameter, keyNames) {
  const {
    xAxisName, yAxisName, xAxisUnit, yAxisUnit,
    xAxisPosition, yAxisPosition, legendPosition, legendLayout, rotateXAxisLabel, rotateYAxisLabel,
    zoomType, showLegend, legendLabelFormat, floatingLegend,
    tooltipPrecision,
    mainTitle, subTitle,
    markerRadius,
  } = parameter

  const option = {
    chart: { type: 'scatter', },
    title: { text: ' ', },
    xAxis: {
      labels: { rotation: rotateXAxisLabel, },
      startOnTick: true,
      endOnTick: true,
      showLastLabel: true,
    },
    yAxis: {
      labels: { rotation: rotateYAxisLabel, },
    },
    labels: {},
    legend: { enabled: showLegend, labelFormat: '{name}', },
    plotOptions: {
      scatter: {
        marker: {
          radius: markerRadius,
          states: {
            hover: { enabled: true, lineColor: 'rgb(100,100,100)' }
          }
        },
        states: { hover: { marker: { enabled: false } } },
        tooltip: {
          headerFormat: '<b style="color:{series.color}">{series.name}</b><br>',
          pointFormatter: function() {
            let xValue = parseNumberUsingHighchartPrecision(Highcharts, tooltipPrecision, this.x)
            let yValue = parseNumberUsingHighchartPrecision(Highcharts, tooltipPrecision, this.y)

            return `
              x: <b>${xValue}</b> ${xAxisUnit}
              <br>
              y: <b>${yValue}</b> ${yAxisUnit}
            `
          },
        }
      }
    },
    series: data,
  }

  if (mainTitle !== '') { option.title.text = mainTitle  }
  if (subTitle !== '') { option.subtitle = { text: subTitle, } }
  if (xAxisName !== '') { option.xAxis.title = { text: xAxisName, } }
  if (yAxisName !== '') { option.yAxis.title = { text: yAxisName, } }
  if (zoomType !== 'none' ) { option.chart.zoomType = zoomType }
  if (xAxisPosition === 'top') { option.xAxis.opposite = true }
  if (yAxisPosition === 'right') { option.yAxis.opposite = true }
  if (legendPosition === 'top') { option.legend.verticalAlign = 'top' }
  if (legendLayout === 'vertical') { option.legend.layout = legendLayout }
  if (legendLabelFormat !== '') { option.legend.labelFormat = legendLabelFormat }
  if (floatingLegend !== 'default') {
    option.legend.x = -30
    option.legend.y = 25
    option.legend.verticalAlign = 'top'
    option.legend.floating = true
    option.legend.backgroundColor = 'white'
    option.legend.borderColor = '#CCC'
    option.legend.borderWidth = 1
    option.legend.shadow = false

    if (floatingLegend === 'top-right') {
      option.legend.align = 'right'; option.legend.x = -30; option.legend.y = 25
    } else {
      option.legend.align = 'left'; option.legend.x = +50; option.legend.y = 25
    }
  }

  return option
}

export function parseNumberUsingHighchartPrecision(Highcharts, precision, value) {
  try {
    if (precision !== '' &&
      precision.startsWith('.') &&
      precision.endsWith('f')) {
      precision = precision.slice(1, -1)
    }

    if (typeof precision !== 'number') {
      precision = Number.parseInt(precision)
    }
  } catch (error) { /** ignore precision parsing error */ }
  return Highcharts.numberFormat(Math.abs(value), precision, '.', '')
}

