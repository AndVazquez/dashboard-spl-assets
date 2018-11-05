{# Macros importation #}

{% import 'templates/j2-templates/js/general-functionalities/macros/chart-title.js' as chart_title with context %}
{% import 'templates/j2-templates/js/general-functionalities/macros/render-component-structure.js' as render_structure with context %}
{% import 'templates/j2-templates/js/components/heat-map/macros/export-functionality.js' as export_functionality with context %}
{% import 'templates/j2-templates/js/components/heat-map/macros/control-bar.js' as control_bar with context %}
{% import 'templates/j2-templates/js/components/heat-map/macros/control-panel.js' as control_panel with context %}
{% import 'templates/j2-templates/js/components/heat-map/macros/mouse-functionalities.js' as mouse_functionalities with context %}
{% import 'templates/j2-templates/js/components/heat-map/macros/overview-tooltip.js' as overview_tooltip with context %}


/*
 *  Creation of the heat-map component base logic
 */

function {{ Component['@component_id'] }}() {
    var width = 300,
        height = 500,
        description = "",
        margin = {top: 40, bottom: 45, left: 220, right: 30},
        x_categories, y_categories,
        {% if Component.Dimensions %}
        heatmap_number = {{ Component.Dimensions.Dimension|length }},
        {% for dim in Component.Dimensions.Dimension %}
        data_{{ dim['@dimension_id'] }} = [],
        xScale_{{ dim['@dimension_id'] }}, yScale_{{ dim['@dimension_id'] }},
        xAxis_{{ dim['@dimension_id'] }}, yAxis_{{ dim['@dimension_id'] }},
        description_{{ dim['@dimension_id'] }},
        {% endfor %}
        {% else %}
        data = [],
        xScale, yScale, xAxis, yAxis,
        heatmap_number = 1,
        {% endif %}
        itemHeight = 50, itemWidth = 50,
        yLabels = true, colorScale,
        cellHeight = itemHeight - 1,
        cellWidth = itemWidth - 1,
        range_max, range_min,
        c_scale, active_dimensions = {},
        svg, hm_id = '{{ Component['@component_id'] }}',
        query_handler, legend = true,
        original_svg;

    var updateDimensions;
    {% if Component.Dimensions %}
    {% for dim in Component.Dimensions.Dimension %}
    var updateData_{{ dim['@dimension_id'] }};
    {% endfor %}
    {% else %}
    var updateData;
    {% endif %}

    function my(selection) {

        selection.each(function () {
                {{ chart_title.render_chart_title() }}
                {{ control_bar.render_control_bar() }}

                {{ render_structure.render_component_structure() }}
                {{ control_panel.render_control_panel() }}

                {{ export_functionality.export() }}

                {% if Component.Dimensions %}
                var x_elements = d3.set(data_{{ Component.Dimensions.Dimension.0['@dimension_id'] }}.map(function (item) {
                        return item['x'];
                    })).values(),
                    y_elements = d3.set(data_{{ Component.Dimensions.Dimension.0['@dimension_id'] }}.map(function (item) {
                        return item['y'];
                    })).values();
                {% else %}
                var x_elements = d3.set(data.map(function (item) {
                        return item['x'];
                    })).values(),
                    y_elements = d3.set(data.map(function (item) {
                        return item['y'];
                    })).values();
                {% endif %}

                x_categories = x_elements.length;
                y_categories = y_elements.length;

                d3.select('#vis_container_{{ Component['@component_id'] }}')
                    .style("height", (height + margin.top + margin.bottom) + "px")
                    .append("div")
                    .attr("class", "loader")
                    .attr("id", "main-loader-{{ Component['@component_id'] }}")
                    .style("display", "none")
                    .append("div")
                    .attr("class", "loader-inner ball-spin-fade-loader")
                    .attr("id", "loader-{{ Component['@component_id'] }}")
                    .style("display", "none");

                $('#loader-{{ Component['@component_id'] }}').loaders();

                /* HEAT MAP RENDER */

                {% if Component.Dimensions %}
                {% for dim in Component.Dimensions.Dimension %}
                var xLabels = false;
                {% if loop.first %}
                xLabels = true;
                {% endif %}
                d3.select('#vis_container_{{ Component['@component_id'] }}')
                    .append("div")
                    .attr("id", 'heatmap-{{ dim['@dimension_id'] }}-{{ Component['@component_id'] }}');
                var elements = render_heat_map('#heatmap-{{ dim['@dimension_id'] }}-{{ Component['@component_id'] }}',
                    data_{{ dim['@dimension_id'] }}, xLabels, ((height + margin.top + margin.bottom) / heatmap_number) - 60, {{ dim['@dimension_id'] }},
                    description_{{ dim['@dimension_id'] }});

                xAxis_{{ dim['@dimension_id'] }} = elements[0];
                yAxis_{{ dim['@dimension_id'] }} = elements[1];
                xScale_{{ dim['@dimension_id'] }} = elements[2];
                yScale_{{ dim['@dimension_id'] }} = elements[3];
                {% endfor %}
                colorScale = elements[4];
                {% else %}

                xLabels = true;
                d3.select('#vis_container_{{ Component['@component_id'] }}')
                    .append("div")
                    .attr("id", 'heatmap-{{ Component['@component_id'] }}');
                var elements = render_heat_map('#heatmap-{{ Component['@component_id'] }}',
                    data, xLabels, ((height + margin.top + margin.bottom) / heatmap_number) - 60,
                    "heatmap", description);

                xAxis = elements[0];
                yAxis = elements[1];
                xScale = elements[2];
                yScale = elements[3];
                colorScale = elements[4];
                {% endif %}

                /* LEGEND RENDER */

                if (legend) {
                    var svg_legend = d3.select('#vis_container_{{ Component['@component_id'] }}')
                        .append("svg")
                        .attr("id", 'legend-svg-{{ Component['@component_id'] }}')
                        .attr("height", (((((height + margin.top + margin.bottom) / heatmap_number) - 100) / y_categories) / 2) + 25)
                        .attr("width", width + margin.left + margin.right);

                    var defs = svg.append("defs");

                    var linearGradient = defs.append("linearGradient")
                        .attr("id", "linear-gradient-" + hm_id);

                    linearGradient
                        .attr("x1", "0%")
                        .attr("x2", "100%")
                        .attr("y1", "0%")
                        .attr("y2", "0%");

                    linearGradient.selectAll("stop")
                        .data(colorScale.domain())
                        .enter().append("stop")
                        .attr("offset", function (d, i) {
                            return ((((colorScale.domain()[i] - 0) * (100 - 0)) / (range_max - 0)) + 0) + "%"
                        })
                        .attr("stop-color", function (_, i) {
                            return colorScale(colorScale.domain()[i]);
                        });

                    svg_legend.append("text")
                        .attr("y", (((((height + margin.top + margin.bottom) / heatmap_number)) / y_categories) / 2) / 2 + 15)
                        .attr("x", margin.left - 15)
                        .attr("id", "range-min-label-{{ Component['@component_id'] }}")
                        .style("color", "black")
                        .text(range_min);

                    svg_legend.append("rect")
                        .attr("y", (((((height + margin.top + margin.bottom) / heatmap_number)) / y_categories) / 2) / 2 + 7)
                        .attr("x", margin.left)
                        .attr("id", 'legend-{{ Component['@component_id'] }}')
                        .attr("width", width)
                        .attr("height", 10)
                        .attr("class", "legendRect")
                        .style("fill", "url(#linear-gradient-" + hm_id + ")");

                    svg_legend.append("text")
                        .attr("y", (((((height + margin.top + margin.bottom) / heatmap_number)) / y_categories) / 2) / 2 + 15)
                        .attr("x", width + margin.left + 7)
                        .attr("id", "range-max-label-{{ Component['@component_id'] }}")
                        .style("color", "black")
                        .text(range_max);
                }

                /*
                 * render_heat_map: given a container and a certain height, this function renders
                 * a heat-map in the principal visualization container with particular data passed
                 * by argument
                 */

                function render_heat_map(container, data, xLabels, height, id, description) {
                    itemWidth = width / x_categories;
                    itemHeight = (height) / y_categories;
                    cellHeight = itemHeight;
                    cellWidth = itemWidth;

                    original_svg = d3.select(container)
                        .attr("id", "original-svg-" + hm_id + "-" + id)
                        .append("svg")
                        .attr("width", width + margin.right + margin.left)
                        .attr("height", height + margin.top + margin.bottom);

                    svg = original_svg
                        .append("g")
                        .attr("id", "svg-" + hm_id + "-" + id)
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                        .attr("width", width + margin.right + margin.left)
                        .attr("height", (height + margin.top + margin.bottom));

                    {{ overview_tooltip.create_tooltip() }}

                    var xScale = d3.scaleBand()
                        .domain(x_elements)
                        .range([0, x_categories * itemWidth]);

                    var xAxis = d3.axisTop()
                        .scale(xScale);
                    if (xLabels) {
                        var tooltip = d3.select("body").append("div")
                            .attr("class", "tooltip")
                            .style("display", "none")
                            .style("opacity", 0);

                        xAxis.tickFormat(function (_, i) {
                            return String.fromCharCode(parseInt(data[i]['icon'], 16));
                        });
                    }
                    else {
                        xAxis.tickFormat("");
                    }

                    var yScale = d3.scaleBand()
                        .domain(y_elements)
                        .range([0, y_categories * itemHeight]);

                    var yAxis = d3.axisLeft()
                        .scale(yScale);

                    if (yLabels) {
                        yAxis.tickFormat(function (d) {
                            return d;
                        });
                    }
                    else {
                        yAxis.tickFormat("");
                    }

                    var color_domain = [range_min];
                    var i = range_min;
                    while (i < range_max) {
                        i += 0.25;
                        color_domain.push(i);
                    }

                    var colorScale = d3.scaleThreshold()
                        .domain(color_domain);

                    var cScale = d3.scaleSequential(c_scale)
                        .domain([range_min, range_max]);

                    var cRange = [];

                    colorScale.domain().forEach(function (d) {
                        cRange.push(cScale(d));
                    });

                    colorScale.range(cRange);

                    var cells = svg.selectAll('rect')
                        .data(data)
                        .enter().append('g')
                        .append('rect')
                        .attr('class', function (d) {
                            return "cell " + d['y'].replace(/[^\x00-\x7F]/g, "").replace(/,/g, "_")
                                    .replace("...", "").replace(/\//g, "_").replace(/ /g, "_") + " " +
                                d['x'].replace(/[^\x00-\x7F]/g, "").replace(/,/g, "_")
                                    .replace("...", "").replace(/\//g, "_").replace(/ /g, "_")
                                    .replace(/\//g, "_")
                                + " _" + hm_id;
                        })
                        .attr('width', cellWidth)
                        .attr('height', cellHeight)
                        .attr('y', function (d) {
                            return yScale(d['y']);
                        })
                        .attr('x', function (d) {
                            return xScale(d['x']);
                        })
                        .attr('fill', function (d) {
                            if (isNaN(d['value'])) {
                                return 'silver';
                            }
                            return colorScale(d['value']);
                        })
                        .attr("stroke-width", 2)
                        .attr("stroke", "white")
                        .on('mouseover', {{ mouse_functionalities.mouseover() }})
                        .on('mouseout', {{ mouse_functionalities.mouseout() }});

                    svg.append("g")
                        .attr("class", "y axis _" + hm_id)
                        .call(yAxis)
                        .selectAll('.tick text')
                        .call(verticalWrap, margin.left)
                        .on("mouseover", function (d) {
                            var this_id = d.replace(/[^\x00-\x7F]/g, "").replace(/,/g, "_").replace("...", "")
                                .replace(/\//g, "_").replace(/ /g, "_").replace(/\//g, "_");

                            d3.select(this).style("cursor", "pointer");
                            d3.select('#vis_container_{{ Component['@component_id'] }}').selectAll(".cell")
                                .style("opacity", 0.25);
                            d3.select('#vis_container_{{ Component['@component_id'] }}').selectAll(".cell." + this_id)
                                .style("opacity", 1);

                            Object.keys(active_dimensions).forEach(function (k) {
                                d3.select('#vis_container_{{ Component['@component_id'] }}').selectAll(".cell." + k)
                                    .style("opacity", 1);
                            });
                        })
                        .on("mouseout", function (d) {
                            var this_id = d.replace(/[^\x00-\x7F]/g, "").replace(/,/g, "_").replace("...", "")
                                .replace(/\//g, "_").replace(/ /g, "_").replace(/\//g, "_");

                            if (Object.keys(active_dimensions).length == 0) {
                                d3.select(this).style("cursor", "default");
                                d3.select('#vis_container_{{ Component['@component_id'] }}').selectAll(".cell")
                                    .style("opacity", 1);
                            }
                            else {
                                if (!(this_id in active_dimensions)) {
                                    d3.select('#vis_container_{{ Component['@component_id'] }}').selectAll(".cell." + this_id)
                                        .style("opacity", 0.25);

                                    Object.keys(active_dimensions).forEach(function (k) {
                                        d3.select('#vis_container_{{ Component['@component_id'] }}').selectAll(".cell." + k)
                                            .style("opacity", 1);
                                    });
                                }
                            }
                        })
                        .on("click", function (d) {
                            var this_id = d.replace(/[^\x00-\x7F]/g, "").replace(/,/g, "_").replace("...", "")
                                .replace(/\//g, "_").replace(/ /g, "_").replace(/\//g, "_");

                            if (this_id in active_dimensions) {
                                delete active_dimensions[this_id];
                                d3.select('#vis_container_{{ Component['@component_id'] }}').selectAll(".cell." + this_id)
                                    .style("opacity", 0.25);

                                if (Object.keys(active_dimensions).length == 0) {
                                    d3.select('#vis_container_{{ Component['@component_id'] }}').selectAll(".cell")
                                        .style("opacity", 1);
                                }
                            }
                            else {
                                active_dimensions[this_id] = true
                            }
                        });

                    svg.select('.y.axis._' + hm_id)
                        .selectAll('line')
                        .style("opacity", 0);

                    svg.select('.y.axis._' + hm_id)
                        .selectAll('path')
                        .style("opacity", 0);

                    svg.append("g")
                        .attr("class", "x axis")
                        .call(xAxis)
                        .selectAll('text')
                        .attr('class', 'icon')
                        .attr('dy', -0.5)
                        .attr("text-anchor", 'middle')
                        .call(horizontalWrap, cellWidth)
                        .on("mouseover", function (d) {
                            tooltip.html(d + "<br/>")
                                .style("left", (d3.event.pageX) + "px")
                                .style("top", (d3.event.pageY - 28) + "px");

                            tooltip.transition()
                                .duration(200)
                                .style("display", "block")
                                .style("opacity", 1);

                            var this_id = d.replace(/[^\x00-\x7F]/g, "").replace(/,/g, "_")
                                .replace("...", "")
                                .replace(/\//g, "_").replace(/ /g, "_").replace(/\//g, "_");

                            d3.select(this).style("cursor", "pointer");
                            d3.select(this).style("opacity", 1);
                            d3.select('#vis_container_{{ Component['@component_id'] }}').selectAll(".cell")
                                .style("opacity", 0.25);
                            d3.select('#vis_container_{{ Component['@component_id'] }}').selectAll(".cell." + this_id)
                                .style("opacity", 1);

                            Object.keys(active_dimensions).forEach(function (k) {
                                d3.select('#vis_container_{{ Component['@component_id'] }}').selectAll(".cell." + k)
                                    .style("opacity", 1);
                            });
                        })
                        .on("mouseout", function (d) {
                            tooltip.transition()
                                .duration(200)
                                .style("display", "none")
                                .style("opacity", 0);

                            var this_id = d.replace(/[^\x00-\x7F]/g, "").replace(/,/g, "_").replace("...", "")
                                .replace(/\//g, "_").replace(/ /g, "_").replace(/\//g, "_");

                            if (Object.keys(active_dimensions).length == 0) {
                                d3.select(this).style("cursor", "default");
                                d3.select(this).style("opacity", 0.6);
                                d3.select('#vis_container_{{ Component['@component_id'] }}').selectAll(".cell")
                                    .style("opacity", 1);
                            }
                            else {
                                if (!(this_id in active_dimensions)) {
                                    d3.select('#vis_container_{{ Component['@component_id'] }}').selectAll(".cell." + this_id)
                                        .style("opacity", 0.25);
                                    d3.select(this).style("opacity", 0.6);

                                    Object.keys(active_dimensions).forEach(function (k) {
                                        d3.select('#vis_container_{{ Component['@component_id'] }}').selectAll(".cell." + k)
                                            .style("opacity", 1);
                                    });
                                }
                            }
                        })
                        .on("click", function (d) {
                            var this_id = d.replace(/[^\x00-\x7F]/g, "").replace(/,/g, "_").replace("...", "")
                                .replace(/\//g, "_").replace(/ /g, "_").replace(/\//g, "_");

                            if (this_id in active_dimensions) {
                                delete active_dimensions[this_id];
                                d3.select('#vis_container_{{ Component['@component_id'] }}').selectAll(".cell." + this_id)
                                    .style("opacity", 0.25);

                                if (Object.keys(active_dimensions).length == 0) {
                                    d3.select('#vis_container_{{ Component['@component_id'] }}').selectAll(".cell")
                                        .transition()
                                        .style("opacity", 1);
                                }
                            }
                            else {
                                active_dimensions[this_id] = true
                            }
                        });

                    svg.select('.x.axis')
                        .selectAll('line')
                        .style("opacity", 0);

                    svg.select('.x.axis')
                        .selectAll('path')
                        .style("opacity", 0);

                    svg.append("text")
                        .attr("class", "y axis descr")
                        .attr("x", (y_categories * cellHeight) / 2)
                        .attr("dy", ".71em")
                        .attr("y", -x_categories * cellWidth - 15)
                        .attr("transform", 'rotate(90)')
                        .style("text-anchor", "middle")
                        .style("font-size", "12px")
                        .text(description);

                    return [xAxis, yAxis, xScale, yScale, colorScale];
                }

                /*
                 * updateDimensions: once the width and height of the component have been modified,
                 * this function updates the heat map size to fit the new width and height
                 */

                updateDimensions = function () {
                    {{ render_structure.recalculate_dimensions() }}

                    d3.select('#legend-svg-{{ Component['@component_id'] }}')
                        .transition()
                        .duration(1000)
                        .attr("width", width + margin.left + margin.top);
                    d3.select('#legend-{{ Component['@component_id'] }}')
                        .transition()
                        .duration(1000)
                        .attr("x", margin.left)
                        .attr("width", width);

                    d3.select("#range-min-label-{{ Component['@component_id'] }}")
                        .transition()
                        .duration(1000)
                        .attr("x", margin.left - 15);

                    d3.select("#range-max-label-{{ Component['@component_id'] }}")
                        .transition()
                        .duration(1000)
                        .attr("x", width + margin.left + 13);

                    {% if Component.Dimensions %}
                    {% for dim in Component.Dimensions.Dimension %}
                    update_heatmap_dimensions({{ dim['@dimension_id'] }}, (height / heatmap_number) - 60,
                        xScale_{{ dim['@dimension_id'] }}, yScale_{{ dim['@dimension_id'] }},
                        xAxis_{{ dim['@dimension_id'] }}, yAxis_{{ dim['@dimension_id'] }});
                    {% endfor %}
                    {% else %}
                    update_heatmap_dimensions("heatmap", (height / heatmap_number) - 60,
                        xScale, yScale,
                        xAxis, yAxis);
                    {% endif %}
                };

                /*
                 * Generic function for updating the dimensions of every single heat map
                 * within the component
                 */

                function update_heatmap_dimensions(id, height, xScale, yScale, xAxis, yAxis) {
                    d3.select("#original-svg-" + hm_id + "-" + id)
                        .attr("width", width + margin.left + margin.right);

                    svg = d3.select("#svg-" + hm_id + "-" + id).attr("width", width + margin.left + margin.right);

                    d3.select(svg.node().parentNode)
                        .transition()
                        .duration(1000)
                        .style('width', (width + margin.left + margin.right) + 'px');

                    itemWidth = width / x_categories;
                    cellHeight = itemHeight;
                    cellWidth = itemWidth;

                    xScale.range([0, x_categories * itemWidth]);

                    svg.select(".y.axis._" + hm_id)
                        .transition()
                        .duration(1000)
                        .call(yAxis)
                        .selectAll('line')
                        .style("opacity", 0);

                    svg.select(".x.axis")
                        .transition()
                        .duration(1000)
                        .call(xAxis)
                        .selectAll('line')
                        .style("opacity", 0);

                    svg.selectAll('.cell')
                        .transition()
                        .duration(1000)
                        .attr('width', cellWidth)
                        .attr('height', cellHeight)
                        .attr('y', function (d) {
                            return yScale(d['y']);
                        })
                        .attr('x', function (d) {
                            return xScale(d['x']);
                        });

                    svg.selectAll(".y.axis.descr")
                        .transition()
                        .duration(1000)
                        .attr("x", (y_categories * cellHeight) / 2)
                        .attr("y", -x_categories * cellWidth - 15)
                        .style("text-anchor", "middle")
                        .style("font-size", "12px");

                    if (legend) {
                        svg.select(".legendRect")
                            .transition()
                            .duration(1000)
                            .attr("y", y_categories * itemHeight + margin.bottom / 2)
                            .attr("x", 0)
                            .attr("width", x_categories * itemWidth)
                            .style("fill", "url(#linear-gradient-" + hm_id + ")");

                        d3.select("#range-max-label-{{ Component['@component_id'] }}")
                            .transition()
                            .duration(1000)
                            .attr("x", width + margin.left + 8);
                    }

                    svg.select('.y.axis._' + hm_id).selectAll('.tick text')
                        .call(verticalWrap, margin.left);
                }

                /*
                 * updateData: once the data of the component have been modified,
                 * this functions update the heat map to present the new information
                 */

                {% if Component.Dimensions %}
                {% for dim in Component.Dimensions.Dimension %}
                updateData_{{ dim['@dimension_id'] }} = function () {
                    update_heatmap_data(data_{{ dim['@dimension_id'] }},
                        ((height + margin.top + margin.bottom) / heatmap_number) - 60, {{ dim['@dimension_id'] }},
                        yScale_{{ dim['@dimension_id'] }}, yAxis_{{ dim['@dimension_id'] }},
                        xScale_{{ dim['@dimension_id'] }}, colorScale,
                        description_{{ dim['@dimension_id'] }});
                };
                {% endfor %}
                {% else %}
                updateData = function () {
                    update_heatmap_data(data, ((height + margin.top + margin.bottom) / heatmap_number) - 60, "heatmap",
                        yScale, yAxis, xScale, colorScale, description);
                };
                {% endif %}

                /*
                 * Generic function for updating the data of every single heat map
                 * within the component
                 */

                function update_heatmap_data(data, height, id, yScale, yAxis, xScale, colorScale, description) {
                    var x_elements = d3.set(data.map(function (item) {
                            return item['x'];
                        })).values(),
                        y_elements = d3.set(data.map(function (item) {
                            return item['y'];
                        })).values();

                    x_categories = x_elements.length;
                    y_categories = y_elements.length;

                    itemWidth = width / x_categories;
                    itemHeight = height / y_categories;
                    cellHeight = itemHeight;
                    cellWidth = itemWidth;

                    yScale.domain(y_elements)
                        .range([0, y_categories * itemHeight]);

                    svg = d3.select("#svg-" + hm_id + "-" + id);

                    {{ overview_tooltip.create_tooltip() }}

                    svg.select(".y.axis._" + hm_id)
                        .transition()
                        .duration(1000)
                        .call(yAxis);

                    svg.select(".y.axis._" + hm_id).selectAll('.tick text')
                        .on("mouseover", function (d) {
                            var this_id = d.replace(/[^\x00-\x7F]/g, "").replace(/,/g, "_").replace("...", "")
                                .replace(/\//g, "_").replace(/ /g, "_").replace(/\//g, "_");

                            d3.select(this).style("cursor", "pointer");
                            d3.select('#vis_container_{{ Component['@component_id'] }}').selectAll(".cell")
                                .style("opacity", 0.25);
                            d3.select('#vis_container_{{ Component['@component_id'] }}').selectAll(".cell." + this_id)
                                .style("opacity", 1);

                            Object.keys(active_dimensions).forEach(function (k) {
                                d3.select('#vis_container_{{ Component['@component_id'] }}').selectAll(".cell." + k)
                                    .style("opacity", 1);
                            });
                        })
                        .on("mouseout", function (d) {
                            var this_id = d.replace(/[^\x00-\x7F]/g, "").replace(/,/g, "_").replace("...", "")
                                .replace(/\//g, "_").replace(/ /g, "_").replace(/\//g, "_");

                            if (Object.keys(active_dimensions).length == 0) {
                                d3.select(this).style("cursor", "default");
                                d3.select('#vis_container_{{ Component['@component_id'] }}').selectAll(".cell")
                                    .style("opacity", 1);
                            }
                            else {
                                if (!(this_id in active_dimensions)) {
                                    d3.select('#vis_container_{{ Component['@component_id'] }}').selectAll(".cell." + this_id)
                                        .style("opacity", 0.25);

                                    Object.keys(active_dimensions).forEach(function (k) {
                                        d3.select('#vis_container_{{ Component['@component_id'] }}').selectAll(".cell." + k)
                                            .style("opacity", 1);
                                    });
                                }
                            }
                        })
                        .on("click", function (d) {
                            var this_id = d.replace(/[^\x00-\x7F]/g, "").replace(/,/g, "_").replace("...", "")
                                .replace(/\//g, "_").replace(/ /g, "_").replace(/\//g, "_");

                            if (this_id in active_dimensions) {
                                delete active_dimensions[this_id];
                                d3.select('#vis_container_{{ Component['@component_id'] }}').selectAll(".cell." + this_id)
                                    .style("opacity", 0.25);

                                if (Object.keys(active_dimensions).length == 0) {
                                    d3.select('#vis_container_{{ Component['@component_id'] }}').selectAll(".cell")
                                        .style("opacity", 1);
                                }
                            }
                            else {
                                active_dimensions[this_id] = true
                            }
                        });

                    svg.select('.y.axis._' + hm_id)
                        .selectAll('line')
                        .style("opacity", 0);

                    svg.select('.y.axis._' + hm_id)
                        .selectAll('path')
                        .style("opacity", 0);

                    var cells = svg.selectAll(".cell._" + hm_id)
                        .data(data);

                    cells.attr('class', function (d) {
                        return "cell " + d['y'].replace(/[^\x00-\x7F]/g, "")
                                .replace(/,/g, "_").replace("...", "")
                                .replace(/\//g, "_").replace(/ /g, "_") + " " +
                            d['x'].replace(/[^\x00-\x7F]/g, "").replace(/,/g, "_").replace("...", "")
                                .replace(/\//g, "_").replace(/ /g, "_").replace(/\//g, "_")
                            + " _" + hm_id;
                    })
                        .transition().duration(1000)
                        .style("fill", function (d) {
                            if (isNaN(d['value'])) {
                                return 'silver';
                            }
                            return colorScale(d['value']);
                        })
                        .attr('x', function (d) {
                            return xScale(d['x']);
                        })
                        .attr('y', function (d) {
                            return yScale(d['y']);
                        })
                        .attr('width', cellWidth)
                        .attr('height', cellHeight);

                    cells.enter().append('g')
                        .append('rect')
                        .on('mouseover', {{ mouse_functionalities.mouseover() }})
                        .on('mouseout', {{ mouse_functionalities.mouseout() }})
                        .attr('class', function (d) {
                            return "cell " + d['y'].replace(/[^\x00-\x7F]/g, "").replace(/,/g, "_")
                                    .replace("...", "").replace(/\//g, "_").replace(/ /g, "_") + " " +
                                d['x'].replace(/[^\x00-\x7F]/g, "").replace(/,/g, "_")
                                    .replace("...", "").replace(/\//g, "_").replace(/ /g, "_").replace(/\//g, "_")
                                + " _" + hm_id;
                        })
                        .attr('x', function (d) {
                            return xScale(d['x']);
                        })
                        .attr('y', function (d) {
                            return yScale(d['y']);
                        })
                        .transition()
                        .duration(1000)
                        .attr('fill', function (d) {
                            if (isNaN(d['value'])) {
                                return 'silver';
                            }
                            return colorScale(d['value']);
                        })
                        .attr('width', cellWidth)
                        .attr('height', cellHeight)
                        .attr("stroke-width", 2)
                        .attr("stroke", "white");

                    cells.exit()
                        .transition().duration(1000)
                        .style("opacity", 0)
                        .remove();
                }

                /* Copyright 2010-2018 Mike Bostock.
                   All rights reserved.
                   Taken from https://bl.ocks.org/mbostock/7555321
                 */

                function verticalWrap(text, width) {
                    text.each(function () {
                        var text = d3.select(this),
                            words = text.text().split(/\s+/).reverse(),
                            word,
                            line = [],
                            lineNumber = 0,
                            lineHeight = 1.1, // ems
                            y = text.attr("y"),
                            x = text.attr("x"),
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

                /* Copyright 2010-2018 Mike Bostock.
                   All rights reserved.
                   Taken from https://bl.ocks.org/mbostock/7555321
                 */

                function horizontalWrap(text, width) {
                    text.each(function () {
                        var text = d3.select(this),
                            words = text.text().split(/\s+/).reverse(),
                            word,
                            line = [],
                            lineNumber = 0,
                            lineHeight = 1.1, // ems
                            y = text.attr("y"),
                            dy = parseFloat(text.attr("dy")),
                            tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
                        while (word = words.pop()) {
                            line.push(word);
                            tspan.text(line.join(" "));
                            if (tspan.node().getComputedTextLength() > width) {
                                line.pop();
                                tspan.text(line.join(" "));
                                line = [word];
                                tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                            }
                        }
                    });
                }
            }
        );
    }

    /*
     * Setters and Getters for the different component attributes
     */

    my.margin_top = function (value) {
        if (!arguments.length) return margin.top;
        margin.top = value;
        return my;
    };

    my.margin_bottom = function (value) {
        if (!arguments.length) return margin.bottom;
        margin.bottom = value;
        return my;
    };

    my.margin_left = function (value) {
        if (!arguments.length) return margin.left;
        margin.left = value;
        return my;
    };

    my.margin_right = function (value) {
        if (!arguments.length) return margin.right;
        margin.right = value;
        return my;
    };

    my.legend = function (value) {
        if (!arguments.length) return legend;
        legend = value;
        return my;
    };

    my.yLabels = function (value) {
        if (!arguments.length) return yLabels;
        yLabels = value;
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

        height = value - margin.top - margin.bottom;
        if (typeof updateDimensions === 'function') updateDimensions();
        return my;
    };

    my.dimensions = function (value1, value2) {
        if (!arguments.length) return [width, height];
        width = value1 - margin.left - margin.right;
        if (typeof updateDimensions === 'function') updateDimensions();
        return my;
    };

    my.query_handler = function (qh) {
        if (!arguments.length) return qh;

        query_handler = qh;
        return my;
    };

    {% if Component.Dimensions %}
    {% for dim in Component.Dimensions.Dimension %}
    my.data_{{ dim['@dimension_id'] }} = function (value) {
        if (!arguments.length) return data_{{ dim['@dimension_id'] }};

        range_min = value['min'];
        range_max = value['max'];
        data_{{ dim['@dimension_id'] }} = value;
        description_{{ dim['@dimension_id'] }} = value['dimension'];

        var _data = [];
        _data.push.apply(_data, data_{{ dim['@dimension_id'] }}['values']);
        data_{{ dim['@dimension_id'] }} = _data;
        if (typeof updateData_{{ dim['@dimension_id'] }} === 'function') updateData_{{ dim['@dimension_id'] }}();
        return my;
    };
    {% endfor %}
    {% else %}
    my.data = function (value) {
        if (!arguments.length) return data;

        range_min = value['min'];
        range_max = value['max'];
        data = value;
        description = value['dimension'];

        var _data = [];
        _data.push.apply(_data, data['values']);
        data = _data;
        if (typeof updateData === 'function') updateData();
        return my;
    };
    {% endif %}

    my.cScale = function (value) {
        if (!arguments.length) return c_scale;
        c_scale = value;
        return my;
    };

    // Return the configured instance of the component
    return my;
}