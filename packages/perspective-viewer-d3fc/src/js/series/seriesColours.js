/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
import * as d3 from "d3";
import {groupFromKey} from "../series/seriesKey";

export function seriesColours(settings) {
    const col = settings.data && settings.data.length > 0 ? settings.data[0] : {};
    const domain = Object.keys(col).filter(k => k !== "__ROW_PATH__");
    return fromDomain(domain);
}

export function seriesColoursFromGroups(settings) {
    const col = settings.data && settings.data.length > 0 ? settings.data[0] : {};
    const domain = [];
    Object.keys(col).forEach(key => {
        if (key !== "__ROW_PATH__") {
            const group = groupFromKey(key);
            if (!domain.includes(group)) {
                domain.push(group);
            }
        }
    });
    return fromDomain(domain);
}

function fromDomain(domain) {
    return domain.length > 1 ? d3.scaleOrdinal(d3.schemeCategory10.map(withOpacity)).domain(domain) : null;
}

function withOpacity(colour) {
    const toInt = offset => parseInt(colour.substring(offset, offset + 2), 16);
    return `rgba(${toInt(1)},${toInt(3)},${toInt(5)},0.5)`;
}

export function withOutOpacity(colour) {
    const lastComma = colour.lastIndexOf(",");
    return lastComma !== -1 ? `${colour.substring(0, lastComma)})` : colour;
}
