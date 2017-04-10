import {
  getPrecisionFormat,
  parseNumberUsingHighchartPrecision,
} from './scatter'

export const BubbleParameter = {
  'minBubbleSize': { valueType: 'int', defaultValue: 3, description: 'minimum size of bubble', },
  'maxBubbleSize': { valueType: 'int', defaultValue: 50, description: 'maximum size of bubble', },
  'plotBorderWidth': { valueType: 'int', defaultValue: 1, description: 'border width of plot', },
  'xGridLineWidth': { valueType: 'int', defaultValue: 1, description: 'grid line width of X axis', },
  'yGridLineWidth': { valueType: 'int', defaultValue: 1, description: 'grid line width of Y axis', },
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
  'zAxisUnit': { valueType: 'string', defaultValue: '', description: 'unit of zAxis', },
  'xAxisName': { valueType: 'string', defaultValue: '', description: 'name of xAxis', },
  'yAxisName': { valueType: 'string', defaultValue: '', description: 'name of yAxis', },
}

export function createBubbleChartDataStructure(rows, key1Names, key2Names, selectors) {
  const series = []

  const xAxisValues = key1Names.map(kn => {
    let x = null

    try { x = parseFloat(kn) }
    catch (error) { /** ignore parsing error, just pushing null */ }

    return x
  })

  const yAxisValues = key2Names.map(kn => {
    let y = null

    try { y = parseFloat(kn) }
    catch (error) { /** ignore parsing error, just pushing null */ }

    return y
  })

  for (let i = 0; i < selectors.length; i++) {
    const selector = selectors[i]
    const s = { name: selector, data: [], }

    for (let x = 0; x < xAxisValues.length; x++) {
      const xValue = xAxisValues[x]

      for (let y = 0; y < yAxisValues.length; y++) {
        const yValue = yAxisValues[y]

        let zValue = null
        try {
          zValue = rows[i].value[x][y]
        } catch (error) {
          continue; // if zValue does not exist, continue
        }

        if (typeof zValue === 'undefined') {
          continue;
        }

        try { zValue = parseFloat(zValue) }
        catch (error) { zValue = null }

        if (xValue !== null && yValue !== null && zValue !== null) {
          s.data.push({ x: xValue, y: yValue, z: zValue, })
        }
      }
    }

    series.push(s)
  }

  return series
}

export function createBubbleChartOption(Highcharts, data, parameter,
                                        key1Names, key2Names, selectors) {
  const {
    xAxisName, yAxisName, xAxisUnit, yAxisUnit, zAxisUnit,
    xAxisPosition, yAxisPosition, legendPosition, legendLayout, rotateXAxisLabel, rotateYAxisLabel,
    zoomType, showLegend, legendLabelFormat, floatingLegend,
    tooltipPrecision,
    mainTitle, subTitle,
    plotBorderWidth, xGridLineWidth, yGridLineWidth,
    minBubbleSize, maxBubbleSize,
  } = parameter

  const option = {
    chart: { type: 'bubble', plotBorderWidth: plotBorderWidth, },
    title: { text: ' ', },
    xAxis: {
      gridLineWidth: xGridLineWidth,
      labels: { rotation: rotateXAxisLabel, },
    },
    yAxis: {
      gridLineWidth: yGridLineWidth,
      startOnTick: false,
      endOnTick: false,
      labels: { rotation: rotateYAxisLabel, },
    },
    labels: {},
    legend: { enabled: showLegend, labelFormat: '{name}', },
    tooltip: {
      headerFormat: '<b style="color:{series.color}">{series.name}</b><br>',
      pointFormatter: function() {
        let xValue = parseNumberUsingHighchartPrecision(Highcharts, tooltipPrecision, this.x)
        let yValue = parseNumberUsingHighchartPrecision(Highcharts, tooltipPrecision, this.y)
        let zValue = parseNumberUsingHighchartPrecision(Highcharts, tooltipPrecision, this.z)

        return `
              x: <b>${xValue}</b> ${xAxisUnit}
              <br>
              y: <b>${yValue}</b> ${yAxisUnit}
              <br>
              z: <b>${zValue}</b> ${zAxisUnit}
            `
      },
      useHTML: true,
      followPointer: true
    },
    plotOptions: {
      bubble: {
        minSize: minBubbleSize,
        maxSize: maxBubbleSize,
      },
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

