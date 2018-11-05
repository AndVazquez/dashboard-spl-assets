{# Macros importation #}

{% import 'templates/j2-templates/js/components/scatter/macros/zoom-functionality.js' as zoom_functionality with context %}
{% import 'templates/j2-templates/js/components/scatter/macros/export-functionality.js' as export_functionality with context %}
{% import 'templates/j2-templates/js/components/scatter/macros/mouse-functionalities.js' as mouse_functionalities with context %}
{% import 'templates/j2-templates/js/components/scatter/macros/overview-panel-functionalities.js' as overview_functionalities with context %}
{% import 'templates/j2-templates/js/components/scatter/macros/axis-data-handlers.js' as axis_functionality with context %}
{% import 'templates/j2-templates/js/components/scatter/macros/axis-text.js' as axis_text with context %}
{% import 'templates/j2-templates/js/components/scatter/macros/overview-tooltip.js' as overview_tooltip with context %}
{% import 'templates/j2-templates/js/components/scatter/macros/global-reference.js' as global_reference with context %}
{% import 'templates/j2-templates/js/components/scatter/macros/control-panel.js' as control_panel with context %}
{% import 'templates/j2-templates/js/components/scatter/macros/control-bar.js' as control_bar with context %}
{% import 'templates/j2-templates/js/general-functionalities/macros/chart-title.js' as chart_title with context %}
{% import 'templates/j2-templates/js/general-functionalities/macros/render-component-structure.js' as render_structure with context %}


/*
 *  Creation of the scatter diagram component base logic
 */

function {{ Component['@component_id'] }}() {
    var width = 500,
        height = 500,
        lbl = "label",
        val = "value",
        vis_id = '{{ Component['@component_id'] }}',
        yText = "", xText = "",
        xDescr = "", yDescr = "",
        xUnit = "", yUnit = "",
        rText = "", cText = "",
        rDescr = "", cDescr = "",
        margin = {top: 15, bottom: 70, left: 80, right: 50},
        yData = [], xData = [], rData = [],
        radius = 35, legend_svg,
        xScale, yScale, rScale,
        xAxis, yAxis, x_min, x_max,
        y_min, y_max, r_min, r_max,
        svg, data, tip, query_handler,
        original_svg, default_radius = 3;

    var updateDimensions;
    var updateY;
    var updateX;
    var updateR;
    var updateData;
    var updateXLabel;
    var updateYLabel;
    var updateXDescription;
    var updateYDescription;

    {{ global_reference.variable_definition() }}
    {{ zoom_functionality.zoom_variable_definition('xScale', 'yScale', 'xAxis',
    'yAxis', 'xLineVal', 'yLineVal', 'vis_id') }}

    function my(selection) {

        selection.each(function () {
                var tooltipScatterDiagram = d3.select("body").append("div")
                    .attr("class", "tooltip")
                    .attr("id", "compare-tooltip")
                    .style("display", "none")
                    .style("opacity", 0);

            console.log("3) {{ Component['@component_id'] }}:", height)


                {{ chart_title.render_chart_title() }}
                {{ control_bar.render_control_bar() }}
                {{ render_structure.render_component_structure() }}
                {{ control_panel.render_control_panel('query_handler', 'vis_id') }}
                {{ export_functionality.export() }}
                {{ overview_tooltip.create_overview_tooltip('vis_id') }}
                {{ axis_functionality.render_axis_handlers('xText', 'yText', 'vis_id') }}

                xScale = d3.scaleLinear()
                    .range([0, width]);

                yScale = d3.scaleLinear()
                    .range([height, 0]);

                rScale = d3.scaleLog()
                    .range([10, radius]);


                if (typeof x_min === 'undefined') {
                    x_min = d3.min([0, d3.min(data, function (d) {
                        return d['x']
                    })]);
                }

                if (typeof x_max === 'undefined') {
                    x_max = d3.max([0, d3.max(data, function (d) {
                        return d['x']
                    })])
                }

                if (typeof y_min === 'undefined') {
                    y_min = d3.min([0, d3.min(data, function (d) {
                        return d['y']
                    })]);
                }

                if (typeof y_max === 'undefined') {
                    y_max = d3.max([0, d3.max(data, function (d) {
                        return d['y']
                    })])
                }

                if (typeof r_min === 'undefined') {
                    r_min = d3.min([1, d3.min(data, function (d) {
                        if (isNaN(d['r']))
                            return 1;
                        return d['r'];
                    })]);
                }
                else if (r_min == 0) {
                    r_min = 1
                }

                if (typeof r_max === 'undefined') {
                    r_max = d3.max([1, d3.max(data, function (d) {
                        if (isNaN(d['r']))
                            return 1;
                        return d['r'];
                    })])
                }
                else if (r_max == 0) {
                    r_max = 1
                }

                xScale.domain([x_min * -0.2, x_max * 1.1]);
                yScale.domain([y_min * -0.2, y_max * 1.1]);
                rScale.domain([500, 10000]);
                rScale.domain([1, 1000]);

                original_svg = d3.select("#vis_container_{{ Component['@component_id'] }}")
                    .append("svg")
                    .attr("id", "original_svg_{{ Component['@component_id'] }}")
                    .attr("width", width + margin.right + margin.left)
                    .attr("height", height + margin.top + margin.bottom);

                svg = original_svg
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                    .attr("id", "scatter_svg")
                    .attr("width", width)
                    .attr("height", height);

                /* AXIS RENDER */

                yAxis = d3.axisLeft()
                    .scale(yScale);

                xAxis = d3.axisBottom()
                    .scale(xScale);

                svg.append("g")
                    .attr("class", "x axis " + vis_id)
                    .attr("transform", 'translate(0,' + height + ')')
                    .call(xAxis);

                svg.append("g")
                    .attr("class", "y axis " + vis_id)
                    .attr("transform", "translate(0,0)")
                    .call(yAxis);

                svg.append("text")
                    .attr("class", "x axis description " + vis_id)
                    .attr("transform", 'translate(0,' + height + ')')
                    .attr("x", width)
                    .attr("y", -6)
                    .style("text-anchor", "end")
                    .text(xDescr);

                svg.append("text")
                    .attr("class", "y axis description " + vis_id)
                    .attr("transform", 'rotate(-90)')
                    .attr("y", 6)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end")
                    .text(yDescr);

                var colorRange = d3.scaleOrdinal(d3.schemeCategory10);
                var colorGlobal = d3.scaleOrdinal()
                    .range(colorRange.range());

                var clip = svg.append("defs").append("svg:clipPath")
                    .attr("id", "clip-" + vis_id)
                    .append("svg:rect")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("x", 0)
                    .attr("y", 0);

                {{ zoom_functionality.zoom_initialization('[x_min * -0.2, x_max * 1.1]', '[y_min * -0.2, y_max * 1.1]') }}

                tip = d3.tip()
                    .attr('class', 'd3-tip ' + vis_id)
                    .offset([-20, 0])
                    .html(function (d) {
                        var cat = d['c'];
                        return "<strong style='color:" + colorGlobal(cat) + "'>" + cat + "</strong>";
                    });

                var scatter = svg.append("g")
                    .attr("id", "scatterplot-" + vis_id)
                    .attr("width", width)
                    .attr("height", width)
                    .attr("clip-path", "url(#clip-" + vis_id + ")");

                svg.call(tip);

                /* CIRCLES RENDER */

                scatter.selectAll(".dot." + vis_id)
                    .data(data)
                    .enter()
                    .append("circle")
                    .attr("class", "dot " + vis_id)
                    .attr("id", function (d) {
                        return d['c'].replace(/[^\x00-\x7F]/g, "").replace(/ /g, "_") + "_" + "" + vis_id;
                    })
                    .attr("r", function (d) {
                        if (isNaN(d['r'])) {
                            return rScale(1)
                        }
                        return rScale(d['r'])
                    })
                    .attr("cx", function (d) {
                        if (isNaN(d['x'])) {
                            return xScale(0)
                        }
                        return xScale(d['x'])
                    })
                    .attr("cy", function (d) {
                        if (isNaN(d['y'])) {
                            return yScale(0)
                        }
                        return yScale(d['y'])
                    })
                    .style('stroke', function (d) {
                        return colorGlobal(d['c']);
                    })
                    .style("fill", function (d) {
                        return colorGlobal(d['c']);
                    })
                    .style("fill-opacity", 0.7)
                    .on("mouseover", {{ mouse_functionalities.mouseover('colorGlobal', 'xText', 'yText', 'rText', 'vis_id') }})
                    .on("mouseout", {{ mouse_functionalities.mouseout('cText', 'xText', 'yText', 'rText', 'vis_id') }});

                /* LEGEND RENDER */

                var legend_div = d3.select("#vis_container_{{ Component['@component_id'] }}")
                    .append("div")
                    .attr("id", "legend_div_" + vis_id)
                    .style("overflow-y", "scroll")
                    .style("position", "absolute")
                    .style("height", height / 4.5 + "px")
                    .style("left", margin.left + width / 2 + "px")
                    .style("top", "0px");

                legend_svg = legend_div
                    .append("svg")
                    .attr("id", "legend_svg_" + vis_id)
                    .attr("width", width / 2)
                    .attr("height", 19.20 * data.length);

                var legend = legend_svg.selectAll(".legend." + vis_id)
                    .data(data)
                    .enter()
                    .append("g")
                    .attr("class", "legend " + vis_id)
                    .attr("transform", function (d, i) {
                        return "translate(0," + i * 20 + ")";
                    });

                legend.append("rect")
                    .attr("x", width / 2 - 18)
                    .attr("width", 18)
                    .attr("height", 18)
                    .style('stroke', function (d) {
                        return colorGlobal(d['c'])
                    })
                    .style("fill", function (d) {
                        return colorGlobal(d['c'])
                    })
                    .style("fill-opacity", 0.7);

                legend.append("text")
                    .attr("x", width / 2 - 24)
                    .attr("y", 9)
                    .attr("dy", ".35em")
                    .style("text-anchor", "end")
                    .text(function (d) {
                        return d['c'];
                    });

                legend.on("mouseover", {{ mouse_functionalities.mouseover('colorGlobal', 'xText', 'yText', 'rText', 'vis_id') }})
                    .on("mouseout", {{ mouse_functionalities.mouseout('cText', 'xText', 'yText', 'rText', 'vis_id') }});

                {{ global_reference.init_line('yScale', 'xScale', 'yLineVal', 'xLineVal', 'tooltipScatterDiagram', 'vis_id') }}
                {{ axis_text.render_axis_text() }}

                /*
                 * updateDimensions: once the width and height of the component have been modified,
                 * this function updates the scatter diagram size to fit the new width and height
                 */

                updateDimensions = function () {
                    {{ render_structure.recalculate_dimensions() }}

                    original_svg = original_svg
                        .attr("height", height + margin.top + margin.bottom)
                        .attr("width", width + margin.left + margin.right);

                    d3.select(svg.node().parentNode.parentNode)
                        .style("pointer-events", "none")
                        .transition()
                        .duration(1000)
                        .style('height', (height + margin.top + margin.bottom) + 'px')
                        .style('width', (width + margin.left + margin.right) + 'px');

                    xScale.range([0, width]);
                    yScale.range([height, 0]);

                    clip.attr("height", height)
                        .attr("width", width);

                    {{ zoom_functionality.zoom_resize() }}

                    svg.select(".y.axis." + vis_id)
                        .transition()
                        .duration(1000)
                        .call(yAxis);

                    svg.select(".x.axis." + vis_id)
                        .transition()
                        .duration(1000)
                        .attr("transform", "translate(0," + height + ")")
                        .call(xAxis);

                    svg.selectAll(".dot." + vis_id)
                        .transition()
                        .duration(1000)
                        .attr("cx", function (d) {
                            if (isNaN(d['x'])) {
                                return xScale(0)
                            }
                            return xScale(d['x'])
                        })
                        .attr("cy", function (d) {
                            if (isNaN(d['y'])) {
                                return yScale(0)
                            }
                            return yScale(d['y'])
                        })
                        .on("end", function () {
                            d3.select(svg.node().parentNode.parentNode)
                                .style("pointer-events", "auto");
                        });

                    d3.select("#legend_div_" + vis_id)
                        .transition()
                        .duration(1000)
                        .style("left", margin.left + width / 2 + "px");

                    d3.select("#legend_svg_" + vis_id)
                        .transition()
                        .duration(1000)
                        .attr("width", width / 2);

                    d3.selectAll(".legend." + vis_id).selectAll("rect")
                        .transition()
                        .duration(1000)
                        .attr("x", width / 2 - 18);

                    d3.selectAll(".legend." + vis_id).selectAll("text")
                        .transition()
                        .duration(1000)
                        .attr("x", width / 2 - 24)
                        .attr("y", 9);

                    d3.select(".x.axis.description." + vis_id)
                        .transition()
                        .duration(1000)
                        .attr("transform", 'translate(0,' + height + ')')
                        .attr("x", width)
                        .attr("y", -6)
                        .style("text-anchor", "end");

                    {{ axis_functionality.data_handlers_resize('vis_id') }}
                    {{ global_reference.line_resize('xScale', 'xLineVal', 'yScale', 'yLineVal', 'vis_id') }}
                    {{ axis_text.resize_axis_text() }}
                };

                /*
                 * updateX: once the data for the X dimension of the component have been modified,
                 * this function updates the X axis and data of the scatter diagram
                 */

                updateX = function () {
                    if (typeof x_min === 'undefined') {
                        x_min = d3.min([0, d3.min(data, function (d) {
                            return d['x']
                        })]);
                    }

                    if (typeof x_max === 'undefined') {
                        x_max = d3.max([0, d3.max(data, function (d) {
                            return d['x']
                        })])
                    }

                    {{ zoom_functionality.zoom_reset('[x_min * -0.2, x_max * 1.1]', '[y_min * -0.2, y_max * 1.1]') }}

                    xScale.domain([x_min * -0.2, x_max * 1.1]);
                    xAxis.scale(xScale);

                    svg.select(".x.axis")
                        .transition()
                        .duration(1000)
                        .call(xAxis);

                    var dots = svg.select("#scatterplot-" + vis_id)
                        .selectAll(".dot." + vis_id)
                        .data(data);

                    dots.transition()
                        .duration(1000)
                        .attr("cx", function (d) {
                            if (isNaN(d['x'])) {
                                return xScale(0)
                            }
                            return xScale(d['x'])
                        })
                        .attr("cy", function (d) {
                            if (isNaN(d['y'])) {
                                return yScale(0)
                            }
                            return yScale(d['y'])
                        })
                        .on("end", function () {
                            d3.select(svg.node().parentNode.parentNode)
                                .style("pointer-events", "auto");
                        });

                    dots.enter().append("circle")
                        .attr("class", "dot " + vis_id)
                        .transition()
                        .duration(1000)
                        .attr("cx", function (d) {
                            if (isNaN(d['x'])) {
                                return xScale(0)
                            }
                            return xScale(d['x'])
                        })
                        .attr("cy", function (d) {
                            if (isNaN(d['y'])) {
                                return yScale(0)
                            }
                            return yScale(d['y'])
                        });

                    dots.exit()
                        .transition()
                        .duration(1000)
                        .attr("cx", function (_) {
                            return xScale(0)
                        })
                        .style('opacity', 0)
                        .remove();

                    svg.select("#scatterplot-" + vis_id).selectAll(".dot." + vis_id)
                        .on("mouseover", {{ mouse_functionalities.mouseover('colorGlobal', 'xText', 'yText', 'rText', 'vis_id') }})
                        .on("mouseout", {{ mouse_functionalities.mouseout('cText', 'xText', 'yText', 'rText', 'vis_id') }});

                    legend = legend_svg.selectAll('.legend.' + vis_id)
                        .data(data, function (d) {
                            return d['c'].replace(/[^\x00-\x7F]/g, "").replace(/ /g, "_");
                        });

                    legend.select('rect')
                        .style('stroke', function (d) {
                            return colorGlobal(d['c'])
                        })
                        .style("fill", function (d) {
                            return colorGlobal(d['c'])
                        })
                        .style("fill-opacity", 0.7)
                        .transition()
                        .duration(1000)
                        .attr("x", width / 2 - 18)
                        .attr("width", 18)
                        .attr("height", 18)
                        .style('opacity', 1);

                    legend.select('text')
                        .transition()
                        .duration(1000)
                        .attr("x", width / 2 - 24)
                        .attr("y", 9)
                        .attr("dy", ".35em")
                        .style("text-anchor", "end")
                        .text(function (d) {
                            return d['c'];
                        })
                        .style('opacity', 1);

                    var enterSelection = legend.enter()
                        .append('g')
                        .attr("class", "legend " + vis_id)
                        .attr("transform", function (d, i) {
                            return "translate(0," + i * 20 + ")";
                        });

                    enterSelection.append('rect')
                        .style('stroke', function (d) {
                            return colorGlobal(d['c'])
                        })
                        .style("fill", function (d) {
                            return colorGlobal(d['c'])
                        })
                        .style("fill-opacity", 0.7)
                        .transition()
                        .duration(1000)
                        .attr("x", width / 2 - 18)
                        .attr("width", 18)
                        .attr("height", 18)
                        .style('opacity', 1);

                    enterSelection.append('text')
                        .transition()
                        .duration(1000)
                        .attr("x", width / 2 - 24)
                        .attr("y", 9)
                        .attr("dy", ".35em")
                        .style("text-anchor", "end")
                        .text(function (d) {
                            return d['c'];
                        })
                        .style('opacity', 1);

                    legend.exit()
                        .transition()
                        .duration(1000)
                        .style("opacity", 0)
                        .remove();

                    legend_svg.selectAll('.legend.' + vis_id)
                        .on("mouseover", {{ mouse_functionalities.mouseover('colorGlobal', 'xText', 'yText', 'rText', 'vis_id') }})
                        .on("mouseout", {{ mouse_functionalities.mouseout('cText', 'xText', 'yText', 'rText', 'vis_id') }});


                    svg.selectAll(".dot." + vis_id)
                        .on("mouseover", {{ mouse_functionalities.mouseover('colorGlobal', 'xText', 'yText', 'rText', 'vis_id') }})
                        .on("mouseout", {{ mouse_functionalities.mouseout('cText', 'xText', 'yText', 'rText', 'vis_id') }});
                };

                /*
                 * updateY: once the data for the Y dimension of the component have been modified,
                 * this function updates the Y axis and data of the scatter diagram
                 */

                updateY = function () {
                    if (typeof y_min === 'undefined') {
                        y_min = d3.min([0, d3.min(data, function (d) {
                            return d['y']
                        })]);
                    }

                    if (typeof y_max === 'undefined') {
                        y_max = d3.max([0, d3.max(data, function (d) {
                            return d['y']
                        })])
                    }

                    yScale.domain([y_min * -0.2, y_max * 1.1]);
                    yAxis.scale(yScale);

                    {{ zoom_functionality.zoom_reset('[x_min * -0.2, x_max * 1.1]', '[y_min * -0.2, y_max * 1.1]') }}

                    svg.select(".y.axis")
                        .transition()
                        .duration(1000)
                        .call(yAxis);

                    var dots = svg.select("#scatterplot-" + vis_id)
                        .selectAll(".dot." + vis_id)
                        .data(data);

                    dots.transition()
                        .duration(1000)
                        .attr("cx", function (d) {
                            if (isNaN(d['x'])) {
                                return xScale(0)
                            }
                            return xScale(d['x'])
                        })
                        .attr("cy", function (d) {
                            if (isNaN(d['y'])) {
                                return yScale(0)
                            }
                            return yScale(d['y'])
                        })
                        .on("end", function () {
                            d3.select(svg.node().parentNode.parentNode)
                                .style("pointer-events", "auto");
                        });

                    dots.enter().append("circle")
                        .attr("class", "dot " + vis_id)
                        .transition()
                        .duration(1000)
                        .attr("cx", function (d) {
                            if (isNaN(d['x'])) {
                                return xScale(0)
                            }
                            return xScale(d['x'])
                        })
                        .attr("cy", function (d) {
                            if (isNaN(d['y'])) {
                                return yScale(0)
                            }
                            return yScale(d['y'])
                        });

                    dots.exit()
                        .transition()
                        .duration(1000)
                        .attr("cy", function (_) {
                            return yScale(0)
                        })
                        .style('opacity', 0)
                        .remove();

                    svg.select("#scatterplot-" + vis_id)
                        .selectAll(".dot." + vis_id)
                        .on("mouseover", {{ mouse_functionalities.mouseover('colorGlobal', 'xText', 'yText', 'rText', 'vis_id') }})
                        .on("mouseout", {{ mouse_functionalities.mouseout('cText', 'xText', 'yText', 'rText', 'vis_id') }});


                    legend = legend_svg.selectAll('.legend.' + vis_id)
                        .data(data, function (d) {
                            return d['c'].replace(/[^\x00-\x7F]/g, "").replace(/ /g, "_");
                        });

                    legend.select('rect')
                        .style('stroke', function (d) {
                            return colorGlobal(d['c'])
                        })
                        .style("fill", function (d) {
                            return colorGlobal(d['c'])
                        })
                        .style("fill-opacity", 0.7)
                        .transition()
                        .duration(1000)
                        .attr("x", width / 2 - 18)
                        .attr("width", 18)
                        .attr("height", 18)
                        .style('opacity', 1);

                    legend.select('text')
                        .transition()
                        .duration(1000)
                        .attr("x", width / 2 - 24)
                        .attr("y", 9)
                        .attr("dy", ".35em")
                        .style("text-anchor", "end")
                        .text(function (d) {
                            return d['c'];
                        })
                        .style('opacity', 1);

                    var enterSelection = legend.enter()
                        .append('g')
                        .attr("class", "legend " + vis_id)
                        .attr("transform", function (d, i) {
                            return "translate(0," + i * 20 + ")";
                        });

                    enterSelection.append('rect')
                        .style('stroke', function (d) {
                            return colorGlobal(d['c'])
                        })
                        .style("fill", function (d) {
                            return colorGlobal(d['c'])
                        })
                        .style("fill-opacity", 0.7)
                        .transition()
                        .duration(1000)
                        .attr("x", width / 2 - 18)
                        .attr("width", 18)
                        .attr("height", 18)
                        .style('opacity', 1);

                    enterSelection.append('text')
                        .transition()
                        .duration(1000)
                        .attr("x", width / 2 - 24)
                        .attr("y", 9)
                        .attr("dy", ".35em")
                        .style("text-anchor", "end")
                        .text(function (d) {
                            return d['c'];
                        })
                        .style('opacity', 1);

                    legend.exit()
                        .transition()
                        .duration(1000)
                        .style("opacity", 0)
                        .remove();

                    legend_svg.selectAll('.legend.' + vis_id)
                        .on("mouseover", {{ mouse_functionalities.mouseover('colorGlobal', 'xText', 'yText', 'rText', 'vis_id') }})
                        .on("mouseout", {{ mouse_functionalities.mouseout('cText', 'xText', 'yText', 'rText', 'vis_id') }});


                    svg.selectAll(".dot." + vis_id)
                        .on("mouseover", {{ mouse_functionalities.mouseover('colorGlobal', 'xText', 'yText', 'rText', 'vis_id') }})
                        .on("mouseout", {{ mouse_functionalities.mouseout('cText', 'xText', 'yText', 'rText', 'vis_id') }});
                };

                {% if Component|check('InitialData.Radius') %}

                /*
                 * updateR: once the data for the radius of the circles have been modified,
                 * this function updates the radius of the scatter diagram based on the new data
                 */

                updateR = function () {
                    if (typeof r_min === 'undefined') {
                        r_min = d3.min([1, d3.min(data, function (d) {
                            if (isNaN(d['r']))
                                return 1;
                            return d['r'];
                        })]);
                    }
                    else if (r_min == 0) {
                        r_min = 1
                    }

                    if (typeof r_max === 'undefined') {
                        r_max = d3.max([1, d3.max(data, function (d) {
                            if (isNaN(d['r']))
                                return 1;
                            return d['r'];
                        })])
                    }
                    else if (r_max == 0) {
                        r_max = 1
                    }


                    var dots = svg.select("#scatterplot-" + vis_id)
                        .selectAll(".dot." + vis_id)
                        .data(data, function (d) {
                            return d['c'].replace(/[^\x00-\x7F]/g, "").replace(/ /g, "_");
                        });

                    dots.transition()
                        .duration(1000)
                        .attr("r", function (d) {
                            if (isNaN(d['r'])) {
                                return rScale(1)
                            }
                            else if (d['r'] == 0) {
                                return rScale(1)
                            }
                            return rScale(d['r'])
                        })
                        .on("end", function () {
                            d3.select(svg.node().parentNode.parentNode)
                                .style("pointer-events", "auto");
                        });

                    dots.enter().append("circle")
                        .attr("class", "dot " + vis_id)
                        .transition()
                        .duration(1000)
                        .attr("r", function (d) {
                            if (isNaN(d['r'])) {
                                return rScale(1)
                            }
                            else if (d['r'] == 0) {
                                return rScale(1)
                            }
                            return rScale(d['r'])
                        });

                    dots.order();

                    dots.exit()
                        .transition()
                        .duration(1000)
                        .attr("r", function (_) {
                            return rScale(1)
                        })
                        .style('opacity', 0)
                        .remove();

                    svg.select("#scatterplot-" + vis_id)
                        .selectAll(".dot." + vis_id)
                        .on("mouseover", {{ mouse_functionalities.mouseover('colorGlobal', 'xText', 'yText', 'rText', 'vis_id') }})
                        .on("mouseout", {{ mouse_functionalities.mouseout('cText', 'xText', 'yText', 'rText', 'vis_id') }});


                    legend = legend_svg.selectAll('.legend.' + vis_id)
                        .data(data, function (d) {
                            return d['c'].replace(/[^\x00-\x7F]/g, "").replace(/ /g, "_");
                        });

                    legend.select('rect')
                        .style('stroke', function (d) {
                            return colorGlobal(d['c'])
                        })
                        .style("fill", function (d) {
                            return colorGlobal(d['c'])
                        })
                        .style("fill-opacity", 0.7)
                        .transition()
                        .duration(1000)
                        .attr("x", width / 2 - 18)
                        .attr("width", 18)
                        .attr("height", 18)
                        .style('opacity', 1);

                    legend.select('text')
                        .transition()
                        .duration(1000)
                        .attr("x", width / 2 - 24)
                        .attr("y", 9)
                        .attr("dy", ".35em")
                        .style("text-anchor", "end")
                        .text(function (d) {
                            return d['c'];
                        })
                        .style('opacity', 1);

                    var enterSelection = legend.enter()
                        .append('g')
                        .attr("class", "legend " + vis_id)
                        .attr("transform", function (d, i) {
                            return "translate(0," + i * 20 + ")";
                        });

                    enterSelection.append('rect')
                        .style('stroke', function (d) {
                            return colorGlobal(d['c'])
                        })
                        .style("fill", function (d) {
                            return colorGlobal(d['c'])
                        })
                        .style("fill-opacity", 0.7)
                        .transition()
                        .duration(1000)
                        .attr("x", width / 2 - 18)
                        .attr("width", 18)
                        .attr("height", 18)
                        .style('opacity', 1);

                    enterSelection.append('text')
                        .transition()
                        .duration(1000)
                        .attr("x", width / 2 - 24)
                        .attr("y", 9)
                        .attr("dy", ".35em")
                        .style("text-anchor", "end")
                        .text(function (d) {
                            return d['c'];
                        })
                        .style('opacity', 1);

                    legend.exit()
                        .transition()
                        .duration(1000)
                        .style("opacity", 0)
                        .remove();

                    legend_svg.selectAll('.legend.' + vis_id)
                        .on("mouseover", {{ mouse_functionalities.mouseover('colorGlobal', 'xText', 'yText', 'rText', 'vis_id') }})
                        .on("mouseout", {{ mouse_functionalities.mouseout('cText', 'xText', 'yText', 'rText', 'vis_id') }});


                    svg.selectAll(".dot." + vis_id)
                        .on("mouseover", {{ mouse_functionalities.mouseover('colorGlobal', 'xText', 'yText', 'rText', 'vis_id') }})
                        .on("mouseout", {{ mouse_functionalities.mouseout('cText', 'xText', 'yText', 'rText', 'vis_id') }});
                };

                {% endif %}

                /*
                 * updateData: once the data for the component have been modified,
                 * this function updates all data dimensions of the scatter diagram
                 */

                updateData = function () {
                    if (typeof x_min === 'undefined') {
                        x_min = d3.min([0, d3.min(data, function (d) {
                            return d['x']
                        })]);
                    }

                    if (typeof x_max === 'undefined') {
                        x_max = d3.max([0, d3.max(data, function (d) {
                            return d['x']
                        })])
                    }

                    if (typeof y_min === 'undefined') {
                        y_min = d3.min([0, d3.min(data, function (d) {
                            return d['y']
                        })]);
                    }

                    if (typeof y_max === 'undefined') {
                        y_max = d3.max([0, d3.max(data, function (d) {
                            return d['y']
                        })])
                    }

                    if (typeof r_min === 'undefined') {
                        r_min = d3.min([1, d3.min(data, function (d) {
                            if (isNaN(d['r']))
                                return 1;
                            return d['r'];
                        })]);
                    }
                    else if (r_min == 0) {
                        r_min = 1
                    }

                    if (typeof r_max === 'undefined') {
                        r_max = d3.max([1, d3.max(data, function (d) {
                            if (isNaN(d['r']))
                                return 1;
                            return d['r'];
                        })])
                    }
                    else if (r_max == 0) {
                        r_max = 1
                    }

                    clip.attr("height", height)
                        .attr("width", width);

                    xScale.domain([x_min * -0.2, x_max * 1.1]);
                    yScale.domain([y_min * -0.2, y_max * 1.1]);
                    {{ zoom_functionality.zoom_reset('[x_min * -0.2, x_max * 1.1]', '[y_min * -0.2, y_max * 1.1]') }}

                    var categories = data.map(function (d) {
                        return d['c'];
                    });

                    var category_change = (categories.length != colorGlobal.domain().length) ||
                        categories.sort().every(function (element, index) {
                            return element !== colorGlobal.domain().sort()[index];
                        });

                    // We only change the color domain if the agrupation is changed
                    if (category_change) {
                        colorGlobal.domain(data.map(function (d) {
                            return d['c'];
                        }));
                    }

                    xAxis.scale(xScale);
                    yAxis.scale(yScale);

                    svg.select(".x.axis")
                        .transition()
                        .duration(1000)
                        .call(xAxis);

                    svg.select(".y.axis")
                        .transition()
                        .duration(1000)
                        .call(yAxis);

                    var dots = svg.select("#scatterplot-" + vis_id).selectAll(".dot." + vis_id)
                        .data(data, function (d) {
                            return d['c'].replace(/[^\x00-\x7F]/g, "").replace(/ /g, "_");
                        });

                    dots.style('stroke', function (d) {
                        return colorGlobal(d['c']);
                    }).attr("id", function (d) {
                        return d['c'].replace(/[^\x00-\x7F]/g, "").replace(/ /g, "_") + "_" + "" + vis_id;
                    })
                        .style("fill", function (d) {
                            return colorGlobal(d['c']);
                        })
                        .style("fill-opacity", 0.7)
                        .transition()
                        .duration(1000)
                        .style("opacity", 1)
                        .attr("r", function (d) {
                            if (isNaN(d['r'])) {
                                return rScale(1)
                            }
                            else if (d['r'] == 0) {
                                return rScale(1)
                            }
                            return rScale(d['r'])
                        })
                        .attr("cx", function (d) {
                            if (isNaN(d['x'])) {
                                return xScale(0)
                            }
                            return xScale(d['x'])
                        })
                        .attr("cy", function (d) {
                            if (isNaN(d['y'])) {
                                return yScale(0)
                            }
                            return yScale(d['y'])
                        })
                        .on("end", function () {
                            d3.select(svg.node().parentNode.parentNode)
                                .style("pointer-events", "auto");
                        });

                    dots.enter()
                        .append("circle")
                        .attr("class", "dot " + vis_id)
                        .attr("id", function (d) {
                            return d['c'].replace(/[^\x00-\x7F]/g, "").replace(/ /g, "_") + "_" + "" + vis_id;
                        })
                        .style('stroke', function (d) {
                            return colorGlobal(d['c']);
                        })
                        .style("fill", function (d) {
                            return colorGlobal(d['c']);
                        })
                        .style("fill-opacity", 0.7)
                        .attr("cx", function (d) {
                            if (isNaN(d['x'])) {
                                return xScale(0)
                            }
                            return xScale(d['x'])
                        })
                        .attr("cy", function (d) {
                            if (isNaN(d['y'])) {
                                return yScale(0)
                            }
                            return yScale(d['y'])
                        })
                        .transition()
                        .duration(1000)
                        .style("opacity", 1)
                        .attr("r", function (d) {
                            if (isNaN(d['r'])) {
                                return rScale(1)
                            }
                            else if (d['r'] == 0) {
                                return rScale(1)
                            }
                            return rScale(d['r'])
                        })
                        .on("end", function () {
                            d3.select(svg.node().parentNode.parentNode)
                                .style("pointer-events", "auto");
                        });

                    dots.order();

                    dots.exit()
                        .transition()
                        .duration(1000)
                        .attr("r", function (_) {
                            return rScale(1)
                        })
                        .style('opacity', 0)
                        .remove();

                    d3.select("#legend_svg_" + vis_id)
                        .attr("height", 19.20 * data.length);

                    legend = legend_svg.selectAll('.legend.' + vis_id)
                        .data(data, function (d) {
                            return d['c'].replace(/[^\x00-\x7F]/g, "").replace(/ /g, "_");
                        });

                    legend.select('rect')
                        .style('stroke', function (d) {
                            return colorGlobal(d['c'])
                        })
                        .style("fill", function (d) {
                            return colorGlobal(d['c'])
                        })
                        .style("fill-opacity", 0.7)
                        .transition()
                        .duration(1000)
                        .attr("x", width / 2 - 18)
                        .attr("width", 18)
                        .attr("height", 18)
                        .style('opacity', 1);

                    legend.select('text')
                        .transition()
                        .duration(1000)
                        .attr("x", width / 2 - 24)
                        .attr("y", 9)
                        .attr("dy", ".35em")
                        .style("text-anchor", "end")
                        .text(function (d) {
                            return d['c'];
                        })
                        .style('opacity', 1);

                    var enterSelection = legend.enter()
                        .append('g')
                        .attr("class", "legend " + vis_id)
                        .attr("transform", function (d, i) {
                            return "translate(0," + i * 20 + ")";
                        });

                    enterSelection.append('rect')
                        .style('stroke', function (d) {
                            return colorGlobal(d['c'])
                        })
                        .style("fill", function (d) {
                            return colorGlobal(d['c'])
                        })
                        .style("fill-opacity", 0.7)
                        .transition()
                        .duration(1000)
                        .attr("x", width / 2 - 18)
                        .attr("width", 18)
                        .attr("height", 18)
                        .style('opacity', 1);

                    enterSelection.append('text')
                        .transition()
                        .duration(1000)
                        .attr("x", width / 2 - 24)
                        .attr("y", 9)
                        .attr("dy", ".35em")
                        .style("text-anchor", "end")
                        .text(function (d) {
                            return d['c'];
                        })
                        .style('opacity', 1);

                    legend.exit()
                        .transition()
                        .duration(1000)
                        .style("opacity", 0)
                        .remove();

                    legend_svg.selectAll('.legend.' + vis_id)
                        .on("mouseover", {{ mouse_functionalities.mouseover('colorGlobal', 'xText', 'yText', 'rText', 'vis_id') }})
                        .on("mouseout", {{ mouse_functionalities.mouseout('cText', 'xText', 'yText', 'rText', 'vis_id') }});


                    svg.select("#scatterplot-" + vis_id)
                        .selectAll(".dot." + vis_id)
                        .on("mouseover", {{ mouse_functionalities.mouseover('colorGlobal', 'xText', 'yText', 'rText', 'vis_id') }})
                        .on("mouseout", {{ mouse_functionalities.mouseout('cText', 'xText', 'yText', 'rText', 'vis_id') }});
                };

                {{ global_reference.x_line_update('xScale', 'xLineVal', 'vis_id') }}

                {{ global_reference.y_line_update('yScale', 'yLineVal', 'vis_id') }}

                /*
                 * updateXLabel: this function updates the dimension label for the X dimension
                 */

                updateXLabel = function () {
                    {% if Component|check('Controls.DataSelectors.xAxis.@location') == "Axis" %}
                    d3.selectAll(".dropup.xlabel." + vis_id)
                        .select("button")
                        .select("text")
                        .transition()
                        .duration(1000)
                        .text(xText);
                    {% else %}
                    d3.select("#x-text-" + vis_id)
                        .transition()
                        .duration(1000)
                        .text(xText);
                    {% endif %}
                };

                /*
                 * updateYLabel: this function updates the dimension label for the Y dimension
                 */

                updateYLabel = function () {
                    {% if Component|check('Controls.DataSelectors.yAxis.@location') == "Axis" %}
                    d3.selectAll(".dropup.ylabel." + vis_id)
                        .select("button")
                        .select("text")
                        .transition()
                        .duration(1000)
                        .text(yText);
                    {% else %}
                    d3.select("#y-text-" + vis_id)
                        .transition()
                        .duration(1000)
                        .text(yText);
                    {% endif %}
                };

                /*
                 * updateXDescription: this function updates the description label for the X axis
                 */

                updateXDescription = function () {
                    svg.select(".x.axis.description." + vis_id)
                        .attr("y", -6)
                        .style("text-anchor", "end")
                        .text(xDescr);
                };

                /*
                 * updateYDescription: this function updates the description label for the Y axis
                 */

                updateYDescription = function () {
                    svg.select(".y.axis.description." + vis_id)
                        .attr("y", 6)
                        .attr("dy", ".71em")
                        .style("text-anchor", "end")
                        .text(yDescr);
                };
            }
        );
    }

    /*
     * Setters and Getters for the different component attributes
     */

    my.x_min = function (value) {
        x_min = value;
        return my;
    };

    my.x_max = function (value) {
        x_max = value;
        return my;
    };

    my.y_min = function (value) {
        y_min = value;
        return my;
    };

    my.y_max = function (value) {
        y_max = value;
        return my;
    };

    my.r_min = function (value) {
        r_min = value;
        return my;
    };

    my.r_max = function (value) {
        r_max = value;
        return my;
    };

    my.yText = function (value) {
        if (!arguments.length) return yText;
        yText = value;
        if (typeof updateYLabel === 'function') updateYLabel();
        {{ overview_functionalities.update_overview() }}
        return my;
    };

    my.xText = function (value) {
        if (!arguments.length) return xText;
        xText = value;
        if (typeof updateXLabel === 'function') updateXLabel();
        {{ overview_functionalities.update_overview() }}
        return my;
    };

    my.yDescr = function (value) {
        if (!arguments.length) return yDescr;
        yDescr = value;
        if (typeof updateYDescription === 'function') updateYDescription();
        return my;
    };

    my.xDescr = function (value) {
        if (!arguments.length) return xDescr;
        xDescr = value;
        if (typeof updateXDescription === 'function') updateXDescription();
        return my;
    };

    my.rText = function (value) {
        if (!arguments.length) return rText;
        rText = value;
        {{ overview_functionalities.update_overview() }}
        return my;
    };

    my.cText = function (value) {
        if (!arguments.length) return cText;
        cText = value;
        {{ overview_functionalities.update_overview() }}
        return my;
    };

    my.rDescr = function (value) {
        if (!arguments.length) return rDescr;
        rDescr = value;
        return my;
    };

    my.cDescr = function (value) {
        if (!arguments.length) return cDescr;
        cDescr = value;
        return my;
    };

    my.xUnit = function (value) {
        if (!arguments.length) return xUnit;
        xUnit = value;
        return my;
    };

    my.yUnit = function (value) {
        if (!arguments.length) return yUnit;
        yUnit = value;
        return my;
    };

    my.width = function (value) {
        if (!arguments.length) return width;
        width = value - margin.left - margin.right;
        if (typeof updateDimensions === 'function') updateDimensions();
        return my;
    };

    my.height = function (value) {
        if (!arguments.length) return height;
        console.log("2) {{ Component["@component_id"] }} ", value)
        height = value - margin.left - margin.right;
        if (typeof updateDimensions === 'function') updateDimensions();
        return my;
    };

    my.dimensions = function (value1, value2) {
        if (!arguments.length) return [width, height];
        width = value1 - margin.left - margin.right - 20;

        if (typeof updateDimensions === 'function') updateDimensions();
        return my;
    };

    my.xData = function (value) {
        if (!arguments.length) return xData;

        if (typeof svg !== 'undefined') {
            d3.select(svg.node().parentNode.parentNode)
                .style("pointer-events", "none");
        }

        var ref = value.reduce(function (obj, o) {
            obj[o[lbl]] = o[val];
            return obj;
        }, {});

        data = data
            .map(function (o) {
                return {
                    c: o['c'],
                    y: o['y'],
                    x: ref[o['c']],
                    r: o['r']
                }
            });

        if (typeof updateX === 'function') updateX();
        return my;
    };

    my.yData = function (value) {
        if (!arguments.length) return yData;

        if (typeof svg !== 'undefined') {
            d3.select(svg.node().parentNode.parentNode)
                .style("pointer-events", "none");
        }

        var ref = value.reduce(function (obj, o) {
            obj[o[lbl]] = o[val];
            return obj;
        }, {});


        data = data
            .map(function (o) {
                return {
                    c: o['c'],
                    y: ref[o['c']],
                    x: o['x'],
                    r: o['r']
                }
            });

        if (typeof updateY === 'function') updateY();
        return my;
    };

    {{ global_reference.x_line_setter() }}

    {{ global_reference.y_line_setter() }}

    my.rData = function (value) {
        if (!arguments.length) return rData;

        if (typeof svg !== 'undefined') {
            d3.select(svg.node().parentNode.parentNode)
                .style("pointer-events", "none");
        }

        var ref = value.reduce(function (obj, o) {
            obj[o[lbl]] = o[val];
            return obj;
        }, {});

        data = data
            .map(function (o) {
                return {
                    c: o['c'],
                    y: o['y'],
                    x: o['x'],
                    r: ref[o['c']]
                }
            });

        data.sort(function (a, b) {
            return b["r"] - a["r"];
        });

        if (typeof updateR === 'function') updateR();
        return my;
    };

    my.data = function (value_x, value_y, value_r) {
        if (!arguments.length) return data;

        if (typeof svg !== 'undefined') {
            console.log(svg.node().parentNode.parentNode)
            d3.select(svg.node().parentNode.parentNode)
                .style("pointer-events", "none");
        }

        var x_ref = value_x.reduce(function (obj, o) {
            obj[o[lbl]] = o[val];
            return obj;
        }, {});

        {% if Component|check('InitialData.Radius') %}
        var r_ref = value_r.reduce(function (obj, o) {
            obj[o[lbl]] = o[val];
            return obj;
        }, {});

        data = value_y
            .map(function (o) {
                return {
                    c: o[lbl],
                    y: o[val],
                    x: x_ref[o[lbl]],
                    r: r_ref[o[lbl]]
                }
            });

        data.sort(function (a, b) {
            return b["r"] - a["r"];
        });
        {% else %}
        data = value_y
            .map(function (o) {
                return {
                    c: o[lbl],
                    y: o[val],
                    x: x_ref[o[lbl]],
                    r: default_radius
                }
            });
        {% endif %}

        if (typeof updateData === 'function') updateData();
        return my;
    };

    my.svg = function () {
        return svg;
    };

    my.query_handler = function (qh) {
        if (!arguments.length) return qh;

        query_handler = qh;
        return my;
    };

    my.margins = function () {
        return margin;
    };

    // Return the configured instance of the component
    return my;
}