/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
import * as fc from "d3fc";
import * as crossAxis from "../axis/crossAxis";
import * as mainAxis from "../axis/mainAxis";
import {areaSeries} from "../series/areaSeries";
import {seriesColours} from "../series/seriesColours";
import {splitAndBaseData} from "../data/splitAndBaseData";
import {legend, filterData} from "../legend/legend";
import {withGridLines} from "../gridlines/gridlines";

import chartSvgCartesian from "../d3fc/chart/svg/cartesian";
import {hardLimitZeroPadding} from "../d3fc/padding/hardLimitZero";

function areaChart(container, settings) {
    const data = splitAndBaseData(settings, filterData(settings));

    const colour = seriesColours(settings);
    legend(container, settings, colour);

    const series = fc.seriesSvgRepeat().series(areaSeries(settings, colour).orient("vertical"));

    const chart = chartSvgCartesian(crossAxis.scale(settings), mainAxis.scale(settings))
        .xDomain(crossAxis.domain(settings)(data))
        .yDomain(
            mainAxis
                .domain(settings)
                .include([0])
                .paddingStrategy(hardLimitZeroPadding())(data)
        )
        .yOrient("left")
        .yNice()
        .plotArea(withGridLines(series).orient("vertical"));

    crossAxis.styleAxis(chart, "x", settings);
    mainAxis.styleAxis(chart, "y", settings);

    chart.xPaddingInner && chart.xPaddingInner(1);
    chart.xPaddingOuter && chart.xPaddingOuter(0.5);

    // render
    container.datum(data).call(chart);
}
areaChart.plugin = {
    type: "d3_y_area",
    name: "[d3fc] Y Area Chart",
    max_size: 25000
};

export default areaChart;
