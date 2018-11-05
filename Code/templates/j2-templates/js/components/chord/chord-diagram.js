{# Macros importation #}

{% import 'templates/j2-templates/js/components/chord/macros/export-functionality.js' as export_functionality with context %}
{% import 'templates/j2-templates/js/components/chord/macros/control-bar.js' as control_bar with context %}
{% import 'templates/j2-templates/js/components/chord/macros/control-panel.js' as control_panel with context %}
{% import 'templates/j2-templates/js/components/chord/macros/overview-tooltip.js' as overview_tooltip with context %}
{% import 'templates/j2-templates/js/components/chord/macros/mouse-functionalities.js' as mouse_functionalities with context %}
{% import 'templates/j2-templates/js/general-functionalities/macros/chart-title.js' as chart_title with context %}
{% import 'templates/j2-templates/js/general-functionalities/macros/render-component-structure.js' as render_structure with context %}

/*
 *  Creation of the chord diagram component base logic
 *  Based on Nadieh Bremer's http://bl.ocks.org/nbremer/f9dacd23eece9d23669c

BSD 2-Clause License

Copyright (c) 2016-2018, Nadieh Bremer
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

 *
 *
 */

function {{ Component['@component_id'] }}() {
    var width = 500,
        height = 500,
        margin = {top: 140, bottom: 60, left: 140, right: 140},
        wrapper, data,
        matrix,
        id = '{{ Component['@component_id'] }}',
        query_handler,
        elements,
        n, names, offset,
        level1, level2,
        svg, original_svg,
        level1_description = "",
        level2_description = "",
        emptyPerc = 0.45,
        emptyStroke, pullOutSize = 50;

    var updateDimensions;
    var updateData;
    var updateL2Label;
    var updateL1Label;

    function my(selection) {

        selection.each(function () {
                {{ chart_title.render_chart_title() }}
                {{ control_bar.render_control_bar() }}

                {{ render_structure.render_component_structure() }}
                {{ control_panel.render_control_panel() }}

                {{ export_functionality.export() }}
                {{ overview_tooltip.create_overview_tooltip() }}

                var outerRadius = Math.min(width, height) / 2,
                    innerRadius = outerRadius * 0.95,
                    opacityDefault = 0.7,
                    opacityLow = 0.02;

                pullOutSize = width / 17;

                original_svg = d3.select("#vis_container_{{ Component['@component_id'] }}")
                    .append("svg")
                    .attr("id", "original_svg_{{ Component['@component_id'] }}")
                    .attr("width", width + margin.right + margin.left)
                    .attr("height", height + margin.top + margin.bottom);

                svg = original_svg
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                    .attr("id", "chord_svg")
                    .attr("width", width)
                    .attr("height", height);

                wrapper = svg.append("g").attr("id", "chord-wrapper-{{ Component['@component_id'] }}")
                    .attr("transform", "translate(" + (width / 2)
                        + "," + (height / 2) + ")");

                offset = (2 * Math.PI) * (emptyStroke / (elements + emptyStroke)) / 4;

                /* TITLES RENDER */

                var titleWrapper = original_svg.append("g").attr("class", "chordTitleWrapper"),
                    titleOffset = 40,
                    titleSeparate = 0;

                titleWrapper.append("text")
                    .style("font-size", "13px")
                    .style("text-anchor", "middle")
                    .attr("id", "title-left-{{ Component['@component_id'] }}")
                    .attr("x", (width / 2 + margin.left - outerRadius - titleSeparate))
                    .attr("y", titleOffset)
                    .text(level1_description);
                titleWrapper.append("text")
                    .style("font-size", "13px")
                    .style("text-anchor", "middle")
                    .attr("id", "title-right-{{ Component['@component_id'] }}")
                    .attr("x", (width / 2 + margin.left + outerRadius + titleSeparate))
                    .attr("y", titleOffset)
                    .text(level2_description);

                /* CHORD DIAGRAM RENDER */

                var chord = customChordLayout()
                    .padding(.02)
                    .sortChords(d3.descending)
                    .matrix(matrix);

                var arc = d3.arc()
                    .innerRadius(innerRadius)
                    .outerRadius(outerRadius)
                    .startAngle(function (d) {
                        return d.startAngle + offset;
                    })
                    .endAngle(function (d) {
                        return d.endAngle + offset;
                    });

                var path = stretchedChord()
                    .radius(innerRadius)
                    .startAngle(function (d) {
                        return d.startAngle + offset;
                    })
                    .endAngle(function (d) {
                        return d.endAngle + offset;
                    })
                    .pullOutSize(pullOutSize);

                var grps = chord.groups();
                for (var i = 0; i < grps.length; i++)
                    grps[i].selected = false;

                var g = wrapper.selectAll("g.group.{{ Component['@component_id'] }}")
                    .data(grps)
                    .enter().append("g")
                    .attr("class", "group {{ Component['@component_id'] }}")
                    .on("mouseover", {{ mouse_functionalities.mouseover() }})
                    .on("mouseout", {{ mouse_functionalities.mouseout() }})
                    .on("click", {{ mouse_functionalities.click() }});

                g.append("path")
                    .attr("class", "chord-path-{{ Component['@component_id'] }}")
                    .style("stroke", function (d, i) {
                        return (names[i] === "" ? "none" : "#8FD3E4");
                    })
                    .style("fill", function (d, i) {
                        return (names[i] === "" ? "none" : "#8FD3E4");
                    })
                    .style("pointer-events", function (d, i) {
                        return (names[i] === "" ? "none" : "auto");
                    })
                    .attr("d", arc)
                    .attr("transform", function (d, i) {
                        if (i >= level1.length) {
                            d.pullOutSize = pullOutSize * -1;
                        }
                        else {
                            d.pullOutSize = pullOutSize;
                        }
                        return "translate(" + d.pullOutSize + ',' + 0 + ")";
                    });

                g.append("text")
                    .attr("class", "chord-text-{{ Component['@component_id'] }}")
                    .each(function (d) {
                        d.angle = ((d.startAngle + d.endAngle) / 2) + offset;
                    })
                    .attr("dy", ".35em")
                    .style("font-size", "10px")
                    .attr("text-anchor", function (d) {
                        return d.angle > Math.PI ? "end" : null;
                    })
                    .attr("transform", function (d, i) {
                        var c = arc.centroid(d);
                        return "translate(" + (c[0] + d.pullOutSize) + "," + c[1] + ")"
                            + "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                            + "translate(" + 20 + ",0)"
                            + (d.angle > Math.PI ? "rotate(180)" : "")
                    })
                    .text(function (d, i) {
                        return names[i];
                    })
                    .call(wrapChord, 70);

                wrapper.selectAll("path.chord.{{ Component['@component_id'] }}")
                    .data(chord.chords)
                    .enter().append("path")
                    .attr("class", function (d) {
                        return "chord " + "chord-" + d.source.index + " chord-" + d.target.index + " {{ Component['@component_id'] }}";
                    })
                    .style("stroke", "none")
                    .style("fill", "#A0A0A0")
                    .style("opacity", function (d) {
                        return (names[d.source.index] === "" ? 0 : opacityDefault);
                    })
                    .style("pointer-events", function (d, i) {
                        return (names[d.source.index] === "" ? "none" : "auto");
                    })
                    .attr("d", path);

                wrapper.append("text")
                    .attr("id", "no-data-text-{{ Component['@component_id'] }}")
                    .style("text-anchor", "middle")
                    .style("display", "none")
                    .text("NO HAY DATOS");

                /*
                 * updateDimensions: once the width and height of the component have been modified,
                 * this function updates the chord diagram size to fit the new width and height
                 */

                updateDimensions = function () {
                    {{ render_structure.recalculate_dimensions() }}

                    original_svg = original_svg
                        .attr("width", width + margin.left + margin.right + 'px')
                        .attr("height", height + margin.top + margin.bottom + 'px');

                    d3.select(svg.node().parentNode)
                        .transition()
                        .duration(1000)
                        .style('width', (width + margin.left + margin.right) + 'px')
                        .style('height', (height + margin.top + margin.bottom) + 'px');

                    d3.select("#chord-wrapper-{{ Component['@component_id'] }}")
                        .attr("transform", "translate(" + (width / 2)
                            + "," + (height / 2) + ")");

                    var outerRadius = Math.min(width, height) / 2;
                    var innerRadius = outerRadius * 0.95;

                    d3.select("#title-left-{{ Component['@component_id'] }}")
                        .transition()
                        .duration(1000)
                        .attr("x", (width / 2 + margin.left - outerRadius - titleSeparate));
                    d3.select("#title-right-{{ Component['@component_id'] }}")
                        .transition()
                        .duration(1000)
                        .attr("x", (width / 2 + margin.left + outerRadius + titleSeparate));

                    var arc = d3.arc()
                        .innerRadius(innerRadius)
                        .outerRadius(outerRadius)
                        .startAngle(function (d) {
                            return d.startAngle + offset;
                        })
                        .endAngle(function (d) {
                            return d.endAngle + offset;
                        });

                    pullOutSize = width / 17;

                    var path = stretchedChord() //Call the stretched chord function
                        .radius(innerRadius)
                        .startAngle(function (d) {
                            return d.startAngle + offset;
                        })
                        .endAngle(function (d) {
                            return d.endAngle + offset;
                        })
                        .pullOutSize(pullOutSize);


                    wrapper.selectAll(".chord-path-{{ Component['@component_id'] }}")
                        .attr("d", arc)
                        .attr("transform", function (d, i) {
                            if (i >= level1.length) {
                                d.pullOutSize = pullOutSize * -1;
                            }
                            else {
                                d.pullOutSize = pullOutSize;
                            }
                            return "translate(" + d.pullOutSize + ',' + 0 + ")";
                        });

                    wrapper.selectAll("g.group.{{ Component['@component_id'] }}")
                        .selectAll("text")
                        .each(function (d) {
                            d.angle = ((d.startAngle + d.endAngle) / 2) + offset;
                        })
                        .attr("transform", function (d, i) {
                            var c = arc.centroid(d);
                            return "translate(" + (c[0] + d.pullOutSize) + "," + c[1] + ")"
                                + "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                                + "translate(" + 20 + ",0)"
                                + (d.angle > Math.PI ? "rotate(180)" : "")
                        });


                    wrapper.selectAll("path.chord.{{ Component['@component_id'] }}")
                        .attr("d", path);

                };


                /*
                 * updateData: once the data of the component have been modified,
                 * this functions update the chord diagram to present the new information
                 */

                updateData = function () {
                    {{ overview_tooltip.hide_overview_tooltip() }}
                    offset = (2 * Math.PI) * (emptyStroke / (elements + emptyStroke)) / 4;
                    var outerRadius = Math.min(width, height) / 2;
                    var innerRadius = outerRadius * 0.95;
                    var no_data = 0;

                    var chord = customChordLayout()
                        .padding(.02)
                        .sortChords(d3.descending)
                        .matrix(matrix);

                    var arc = d3.arc()
                        .innerRadius(innerRadius)
                        .outerRadius(outerRadius)
                        .startAngle(function (d) {
                            if (isNaN(d.startAngle))
                                return 0;
                            return d.startAngle + offset;
                        })
                        .endAngle(function (d) {
                            if (isNaN(d.endAngle))
                                return 0;
                            return d.endAngle + offset;
                        });

                    var path = stretchedChord()
                        .radius(innerRadius)
                        .startAngle(function (d) {
                            if (isNaN(d.startAngle))
                                return 0;
                            return d.startAngle + offset;
                        })
                        .endAngle(function (d) {
                            if (isNaN(d.endAngle))
                                return 0;
                            return d.endAngle + offset;
                        })
                        .pullOutSize(pullOutSize);

                    var grps = chord.groups();
                    for (var i = 0; i < grps.length; i++)
                        grps[i].selected = false;

                    var g = wrapper.selectAll("g.group.{{ Component['@component_id'] }}")
                        .data(grps);

                    g.on("mouseover", {{ mouse_functionalities.mouseover() }})
                        .on("mouseout", {{ mouse_functionalities.mouseout() }})
                        .on("click", {{ mouse_functionalities.click() }});

                    g.select("path")
                        .transition()
                        .duration(1000)
                        .attr("class", "chord-path-{{ Component['@component_id'] }}")
                        .style("stroke", function (d, i) {
                            return (names[i] === "" ? "none" : "#8FD3E4");
                        })
                        .style("fill", function (d, i) {
                            return (names[i] === "" ? "none" : "#8FD3E4");
                        })
                        .style("pointer-events", function (d, i) {
                            return (names[i] === "" ? "none" : "auto");
                        })
                        .attr("d", function (d, i) {
                            if (isNaN(d.value)) {
                                no_data = 1;
                                return "";
                            }
                            return arc(d, i);
                        })
                        .style("opacity", function (d) {
                            if (isNaN(d.startAngle))
                                return 0;
                            return 1;
                        })
                        .attr("transform", function (d, i) {
                            if (i >= level1.length) {
                                d.pullOutSize = pullOutSize * -1;
                            }
                            else {
                                d.pullOutSize = pullOutSize;
                            }
                            return "translate(" + d.pullOutSize + ',' + 0 + ")";
                        });

                    g.select("text")
                        .each(function (d) {
                            d.angle = ((d.startAngle + d.endAngle) / 2) + offset;
                        })
                        .attr("dy", ".35em")
                        .attr("class", "chord-text-{{ Component['@component_id'] }}")
                        .style("font-size", "10px")
                        .attr("text-anchor", function (d) {
                            return d.angle > Math.PI ? "end" : null;
                        })
                        .text(function (d, i) {
                            if (isNaN(d.angle))
                                return "";

                            return names[i];
                        })
                        .call(wrapChord, 70)
                        .transition()
                        .duration(1000)
                        .attr("transform", function (d, i) {
                            if (isNaN(d.angle))
                                return "";
                            var c = arc.centroid(d);
                            return "translate(" + (c[0] + d.pullOutSize) + "," + c[1] + ")"
                                + "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                                + "translate(" + 20 + ",0)"
                                + (d.angle > Math.PI ? "rotate(180)" : "")
                        });

                    var enterG = g.enter();

                    var groupWrp = enterG.append("g")
                        .attr("class", "group {{ Component['@component_id'] }}")
                        .on("mouseover", {{ mouse_functionalities.mouseover() }})
                        .on("mouseout", {{ mouse_functionalities.mouseout() }})
                        .on("click", {{ mouse_functionalities.click() }});

                    groupWrp.append("path")
                        .attr("class", "chord-path-{{ Component['@component_id'] }}")
                        .style("stroke", function (d, i) {
                            return (names[i] === "" ? "none" : "#8FD3E4");
                        })
                        .style("fill", function (d, i) {
                            return (names[i] === "" ? "none" : "#8FD3E4");
                        })
                        .style("pointer-events", function (d, i) {
                            return (names[i] === "" ? "none" : "auto");
                        })
                        .transition()
                        .duration(1000)
                        .attr("d", function (d, i) {
                            if (isNaN(d.value)) {
                                no_data = 1;
                                return "";
                            }
                            return arc(d, i);
                        })
                        .style("opacity", function (d) {
                            if (isNaN(d.startAngle))
                                return 0;
                            return 1;
                        })
                        .attr("transform", function (d, i) {
                            if (i >= level1.length) {
                                d.pullOutSize = pullOutSize * -1;
                            }
                            else {
                                d.pullOutSize = pullOutSize;
                            }
                            return "translate(" + d.pullOutSize + ',' + 0 + ")";
                        });

                    groupWrp.append("text")
                        .attr("class", "chord-text-{{ Component['@component_id'] }}")
                        .each(function (d) {
                            d.angle = ((d.startAngle + d.endAngle) / 2) + offset;
                        })
                        .attr("dy", ".35em")
                        .style("font-size", "10px")
                        .attr("text-anchor", function (d) {
                            return d.angle > Math.PI ? "end" : null;
                        })
                        .text(function (d, i) {
                            if (isNaN(d.angle))
                                return "";

                            return names[i];
                        })
                        .call(wrapChord, 70)
                        .transition()
                        .duration(1000)
                        .attr("transform", function (d, i) {
                            if (isNaN(d.angle))
                                return "";

                            var c = arc.centroid(d);
                            return "translate(" + (c[0] + d.pullOutSize) + "," + c[1] + ")"
                                + "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                                + "translate(" + 20 + ",0)"
                                + (d.angle > Math.PI ? "rotate(180)" : "")
                        });

                    var exitG = g.exit();

                    exitG.transition()
                        .duration(1500)
                        .attr("opacity", 0)
                        .remove();

                    var paths = wrapper.selectAll("path.chord.{{ Component['@component_id'] }}")
                        .data(chord.chords);

                    paths
                        .attr("class", function (d) {
                            return "chord " + "chord-" + d.source.index + " chord-" + d.target.index + " {{ Component['@component_id'] }}";
                        })
                        .style("opacity", function (d) {
                            return (names[d.source.index] === "" ? 0 : opacityDefault);
                        })
                        .style("pointer-events", function (d, i) {
                            return (names[d.source.index] === "" ? "none" : "auto");
                        })
                        .transition()
                        .duration(1000)
                        .attr("d", path);

                    paths.enter().append("path")
                        .attr("class", function (d) {
                            return "chord " + "chord-" + d.source.index + " chord-" + d.target.index + " {{ Component['@component_id'] }}";
                        })
                        .style("stroke", "none")
                        .style("fill", "#A0A0A0")
                        .style("opacity", function (d) {
                            return (names[d.source.index] === "" ? 0 : opacityDefault);
                        })
                        .style("pointer-events", function (d, i) {
                            return (names[d.source.index] === "" ? "none" : "auto");
                        })
                        .transition()
                        .duration(1000)
                        .attr("d", path);

                    paths.exit().transition()
                        .duration(1000)
                        .attr("opacity", 0)
                        .remove();

                    d3.selectAll(".chord.{{ Component['@component_id'] }}")
                        .style("stroke", "none")
                        .style("opacity", function (d) {
                            if (no_data) {
                                return 0;
                            }
                            return (names[d.source.index] === "" ? 0 : opacityDefault);
                        })
                        .style("fill", "#A0A0A0");

                    d3.select("#no-data-text-{{ Component['@component_id'] }}")
                        .style("display", function () {
                            if (no_data)
                                return "block";
                            return "none";
                        });
                };

                /*
                 * updateL1Label: allows the update of the title label for the level 1 of the chord diagram
                 */

                updateL1Label = function () {
                    d3.select("#title-left-{{ Component['@component_id'] }}")
                        .transition()
                        .duration(1500)
                        .text(level1_description);
                };

                /*
                 * updateL1Label: allows the update of the title label for the level 2 of the chord diagram
                 */

                updateL2Label = function () {
                    d3.select("#title-right-{{ Component['@component_id'] }}")
                        .transition()
                        .duration(1500)
                        .text(level2_description);
                };


            }
        );
    }

    /*
     * Setters and Getters for the different component attributes
     */

    my.width = function (value) {
        if (!arguments.length) return width;
        width = value - margin.left - margin.right;
        if (typeof updateDimensions === 'function') updateDimensions();
        return my;
    };

    my.height = function (value) {
        if (!arguments.length) return height;
        height = value - margin.left - margin.right;
        if (typeof updateDimensions === 'function') updateDimensions();
        return my;
    };

    my.dimensions = function (value1, value2) {
        if (!arguments.length) return [width, height];
        width = value1 - margin.left - margin.right;

        if (typeof updateDimensions === 'function') updateDimensions();
        return my;
    };

    my.level1_description = function (value) {
        if (!arguments.length) return level1_description;
        level1_description = value;
        if (typeof updateL1Label === 'function') updateL1Label();
        return my;
    };

    my.level2_description = function (value) {
        if (!arguments.length) return level2_description;
        level2_description = value;
        if (typeof updateL2Label === 'function') updateL2Label();
        return my;
    };

    my.id = function (value) {
        if (!arguments.length) return id;
        id = value;
        return my;
    };

    my.data = function (value) {
        if (!arguments.length) return data;

        level1 = [];
        level2 = [];

        value[0]['values'].forEach(function (y) {
            level2.push(y['label']);
        });

        value.forEach(function (x) {
            level1.push(x['label']);
        });

        level1.push("");
        level2.push("");
        var level2_n = level2.length;
        var level1_n = level1.length;

        names = level1.concat(level2);
        n = level2_n + level1_n;

        var formattedData = dataFormatter(value);

        data = formattedData[0];
        elements = formattedData[1];

        emptyStroke = Math.round(elements * emptyPerc);

        matrix = matrixConstruction(data, level1_n, n, emptyStroke);

        if (typeof updateData === 'function') updateData();

        return my;
    };

    my.svg = function () {
        return svg;
    };

    my.margins = function () {
        return margin;
    };

    my.query_handler = function (qh) {
        if (!arguments.length) return qh;

        query_handler = qh;
        return my;
    };


    /*
     * Specific data formatter for the GraphQL API return schema
     */

    function dataFormatter(dataIn) {
        var elements = 0;

        var data = {};
        dataIn.forEach(function (x) {
            var values = {};

            x['values'].forEach(function (y) {
                values[y['label']] = y['value'];
                elements += y['value'];
            });
            data[x['label']] = values;
        });

        return [data, elements];
    }

    /*
     * Construction of the chord diagram matrix from data with a fixed format
     */

    function matrixConstruction(data, level1_n, n, emptyStroke) {
        var matrix = [];

        for (var y = 0; y < n; y++) {
            matrix[y] = [];
            for (var x = 0; x < n; x++) {
                matrix[y][x] = 0;
            }
        }

        Object.keys(data).forEach(function (key, i) {
            Object.keys(data[key]).forEach(function (key2, j) {
                var value = 0;

                if (!isNaN(data[key][key2])) {
                    value = data[key][key2];
                }

                matrix[i][level1_n + j] = value;
                matrix[level1_n + j][i] = value;
            });
        });

        matrix[level1_n - 1][n - 1] = emptyStroke;
        matrix[n - 1][level1_n - 1] = emptyStroke;

        return matrix;
    }

    /* Copyright 2010-2018 Mike Bostock.
       All rights reserved.
       Taken from https://bl.ocks.org/mbostock/7555321
     */
    
    function wrapChord(text, width) {
        text
            .each(function () {
                var text = d3.select(this),
                    words = text.text().split(/\s+/).reverse(),
                    word,
                    line = [],
                    lineNumber = 0,
                    lineHeight = 1.1,
                    y = 0,
                    x = 0,
                    dy = parseFloat(text.attr("dy")),
                    tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

                while (word = words.pop()) {
                    line.push(word);
                    tspan.text(line.join(" "));
                    if (tspan.node().getComputedTextLength() > width) {
                        line.pop();
                        tspan.text(line.join(" "));
                        line = [word];
                        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                    }
                }
            });
    }

    // Return the configured instance of the component
    return my;
}