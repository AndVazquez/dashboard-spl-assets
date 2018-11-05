{# Macros for rendering and updating data selectors located on X and Y axis of the scatter diagram #}

{%- macro render_axis_handlers(xText, yText, vis_id) %}
{% if Component|check('Controls.DataSelectors.xAxis.@location') == "Axis" %}
d3.select("#vis_container_" + {{ vis_id }})
    .append("div")
    .style('position', 'absolute')
    .style("left", margin.left + "px")
    .style("top", (height + margin.bottom / 1.5) + "px")
    .attr("class", "dropup xlabel " + {{ vis_id }})
    .append("button")
    .style("width", width + "px")
    .style("padding", "0px")
    .attr("class", "btn btn-secondary dropdown-toggle")
    .attr("data-toggle", "dropdown")
    .attr("aria-haspopup", "true")
    .attr("aria-expanded", "false")
    .on("click", function () {
        var display = d3.select("#x-dropdown-" + {{ vis_id }})
            .style("display");

        if (display == "none") {
            d3.select("#x-dropdown-" + {{ vis_id }})
                .style("display", "block")
        }
        else {
            d3.select("#x-dropdown-" + {{ vis_id }})
                .style("display", "none")
            .style("left", "-999px")
            .style("top", "-999px");
        }
    })
    .append("text")
    .attr("text-anchor", "middle")
    .html({{ xText }});

var x_dropdown = d3.select(".dropup.xlabel." + {{ vis_id }})
    .append("div")
    .attr("class", "dropdown-menu scrollable-menu")
    .attr("id", "x-dropdown-" + {{ vis_id }})
    .attr("aria-labelledby", d3.select(".dropup.xlabel." + {{ vis_id }}).attr("id"));

x_dropdown.append("input")
    .attr("type", "text")
    .attr("placeholder", "\uf002 Buscar variable")
    .attr("class", "dropdown-item searchbox")
    .attr("id", "searchbox-x-" + {{ vis_id }})
    .on("keyup", function () {
        var input, filter, ul, li, a, i;
        input = document.getElementById("searchbox-x-" + {{ vis_id }});
        filter = input.value.toUpperCase();
        var div = document.getElementById("x-dropdown-" + {{ vis_id }});
        a = div.getElementsByTagName("a");
        for (i = 0; i < a.length; i++) {
            if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
                a[i].style.display = "block";
            } else {
                a[i].style.display = "none";
            }
        }
    });

x_dropdown.selectAll("a")
    .data({{ Component.Controls.DataSelectors.xAxis.DataResource.DataSource|tojson }})
    .enter()
    .append("a")
    .attr("class", "dropdown-item")
    .attr("title", (function (d) {
        return d['label'];
    }))
    .text(function (d) {
        return d['label'];
    })
    .on("mouseover", function () {
        d3.select(this).style("cursor", "pointer");
    })
    .on("mouseout", function () {
        d3.select(this).style("cursor", "default");
    })
    .on("click", function (d) {
        d3.select("#x-dropdown-" + {{ vis_id }})
                .style("display", "none")
            .style("left", "-999px")
            .style("top", "-999px");

        qh_{{ Component['@component_id'] }}.setXQuery(d['code'], d['metric_code'], 'x', d['endpoint']);
        my.xText(d['label']);
    });
{% endif %}

{% if Component|check('Controls.DataSelectors.yAxis.@location') == "Axis" %}
d3.select("#vis_container_" + {{ vis_id }})
    .append("div")
    .style('position', 'absolute')
    .style("left", (margin.left - 65) + "px")
    .style("top", height + "px")
    .attr("class", "dropup ylabel " + {{ vis_id }})
    .append("button")
    .style("-webkit-transform", "rotate(-90deg)")
    .style("-moz-transform", "rotate(-90deg)")
    .style("-ms-transform", "rotate(-90deg)")
    .style("-o-transform", "rotate(-90deg)")
    .style("transform", "rotate(-90deg)")
    .style("-webkit-transform-origin", "0 0")
    .style("-moz-transform-origin", "0 0")
    .style("-ms-transform-origin", "0 0")
    .style("-o-transform-origin", "0 0")
    .style("transform-origin", "0 0")
    .style("width", height + "px")
    .style("padding", "0px")
    .attr("class", "btn btn-secondary dropdown-toggle")
    .attr("data-toggle", "dropdown")
    .attr("aria-haspopup", "true")
    .attr("aria-expanded", "false")
    .on("click", function () {
        var display = d3.select("#y-dropdown-" + {{ vis_id }})
            .style("display");

        if (display == "none") {
            d3.select("#y-dropdown-" + {{ vis_id }})
                .style("display", "block")
        }
        else {
            d3.select("#y-dropdown-" + {{ vis_id }})
                .style("display", "none")
            .style("left", "-999px")
            .style("top", "-999px");
        }
    })
    .append("text")
    .attr("text-anchor", "middle")
    .html({{ yText }});

var y_dropdown = d3.select(".dropup.ylabel." + {{ vis_id }})
    .append("div")
    .attr("class", "dropdown-menu scrollable-menu")
    .attr("id", "y-dropdown-" + {{ vis_id }})
    .attr("aria-labelledby", d3.select(".dropup.ylabel." + {{ vis_id }}).attr("id"));

y_dropdown.append("input")
    .attr("type", "text")
    .attr("placeholder", "\uf002 Buscar variable")
    .attr("class", "dropdown-item searchbox")
    .attr("id", "searchbox-y-" + {{ vis_id }})
    .on("keyup", function () {
        var input, filter, ul, li, a, i;
        input = document.getElementById("searchbox-y-" + {{ vis_id }});
        filter = input.value.toUpperCase();
        var div = document.getElementById("y-dropdown-" + {{ vis_id }});
        a = div.getElementsByTagName("a");
        for (i = 0; i < a.length; i++) {
            if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
                a[i].style.display = "block";
            } else {
                a[i].style.display = "none";
            }
        }
    });

y_dropdown.selectAll("a")
    .data({{ Component.Controls.DataSelectors.yAxis.DataResource.DataSource|tojson }})
    .enter()
    .append("a")
    .attr("class", "dropdown-item")
    .attr("title", (function (d) {
        return d['label'];
    }))
    .text(function (d) {
        return d['label'];
    })
    .on("mouseover", function () {
        d3.select(this).style("cursor", "pointer");
    })
    .on("mouseout", function () {
        d3.select(this).style("cursor", "default");
    })
    .on("click", function (d) {
        d3.select("#y-dropdown-" + {{ vis_id }})
                .style("display", "none")
            .style("left", "-999px")
            .style("top", "-999px");

        qh_{{ Component['@component_id'] }}.setYQuery(d['code'], d['metric_code'], 'y', d['endpoint']);
        my.yText(d['label']);
    });
{% endif %}
{%- endmacro %}

/**
 * X AND Y AXIS DATA HANDLERS' RESIZE
 **/

{% macro data_handlers_resize(vis_id) %}
{% if Component|check('Controls.DataSelectors.xAxis.@location') == "Axis" %}
d3.select(".dropup.xlabel." + {{ vis_id }})
    .transition()
    .duration(1000)
    .style("left", margin.left + "px")
    .select("button")
    .style("width", width + "px");
{% endif %}
{%- endmacro %}