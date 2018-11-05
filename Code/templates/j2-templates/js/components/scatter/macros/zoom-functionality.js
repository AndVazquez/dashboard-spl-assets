{# Macros for the scatter diagram's zoom feature #}
{% import 'templates/j2-templates/js/components/scatter/macros/overview-tooltip.js' as overview_tooltip with context %}

{% macro zoom_variable_definition(xScale, yScale, xAxis, yAxis, xLineVal, yLineVal, vis_id) %}
{% if Component|check('Zoom') == "True" %}
var ZoomFunctionality = {
    x0domain: null,
    y0domain: null,
    brush: null,
    idleTimeout: null,
    idleDelay: 350,
    addBrush: function () {
        this.brush = d3.brush().extent([[0, 0], [width, height]])
            .on("start", function () {
                d3.select(svg.node().parentNode.parentNode)
                    .style("pointer-events", "none");
                {{ overview_tooltip.hide_overview_tooltip('vis_id') }}
            })
            .on("brush", function () {
                d3.select(svg.node().parentNode.parentNode)
                    .style("pointer-events", "none");
                {{ overview_tooltip.hide_overview_tooltip('vis_id') }}
            })
            .on("end", this.brushended);

        svg.append("g")
            .attr("class", "brush")
            .attr("width", width)
            .attr("height", height)
            .on("click", function () {
                d3.select(svg.node().parentNode.parentNode)
                    .style("pointer-events", "auto");
            })
            .on("dblclick", function () {
                d3.select(svg.node().parentNode.parentNode)
                    .style("pointer-events", "none");
            })
            .call(this.brush);
    },
    brushended: function () {
        d3.select(svg.node().parentNode.parentNode)
            .style("pointer-events", "none");
        {{ overview_tooltip.hide_overview_tooltip('vis_id') }}

        var s = d3.event.selection;
        if (!s) {
            if (!ZoomFunctionality.idleTimeout)
                return ZoomFunctionality.idleTimeout =
                    setTimeout(ZoomFunctionality.idled,
                        ZoomFunctionality.idleDelay);
            ({{ xScale }}).domain(ZoomFunctionality.x0domain);
            ({{ yScale }}).domain(ZoomFunctionality.y0domain);
        } else {
            ({{ xScale }}).domain([s[0][0], s[1][0]].map(({{ xScale }}).invert, {{ xScale }}));
            ({{ yScale }}).domain([s[1][1], s[0][1]].map(({{ yScale }}).invert, {{ yScale }}));
            svg.select(".brush").call(ZoomFunctionality.brush.move, null);
        }
        ZoomFunctionality.zoom();
    },
    idled: function () {
        ZoomFunctionality.idleTimeout = null;
    },
    zoom: function () {
        svg.select(".x.axis")
            .transition()
            .duration(750)
            .call(({{ xAxis }}));

        svg.select(".y.axis")
            .transition()
            .duration(750)
            .call(({{ yAxis }}));

        svg.selectAll(".dot")
            .transition()
            .duration(750)
            .attr("cx", function (d) {
                if (isNaN(d['x']))
                    return ({{ xScale }})(0);

                return ({{ xScale }})(d['x']);
            })
            .attr("cy", function (d) {
                if (isNaN(d['y']))
                    return ({{ yScale }})(0);

                return ({{ yScale }})(d['y']);
            })
            .on("end", function () {
                d3.select(svg.node().parentNode.parentNode)
                    .style("pointer-events", "auto");
            });

        {% if Component|check('Controls.GlobalReference.xAxis') %}
        d3.select("#xLine-" + {{ vis_id }})
            .transition()
            .duration(1000)
            .attr("x1", ({{ xScale }})({{ xLineVal }}))
            .attr("y1", 0)
            .attr("x2", ({{ xScale }})({{ xLineVal }}))
            .attr("y2", height);
        {% endif %}

        {% if Component|check('Controls.GlobalReference.yAxis') %}
        d3.select("#yLine-" + {{ vis_id }})
            .transition()
            .duration(1000)
            .attr("x1", 0)
            .attr("y1", ({{ yScale }})({{ yLineVal }}))
            .attr("x2", width)
            .attr("y2", ({{ yScale }})({{ yLineVal }}));
        {% endif %}
    },
    resetZoom: function () {
        d3.select(svg.node().parentNode.parentNode)
            .style("pointer-events", "none");
        ({{ xScale }}).domain(ZoomFunctionality.x0domain);
        ({{ yScale }}).domain(ZoomFunctionality.y0domain);
        ZoomFunctionality.zoom();
    },
    updateDomains: function (x0, y0) {
        ZoomFunctionality.x0domain = typeof x0 !== 'undefined' ? x0 : ZoomFunctionality.x0domain;
        ZoomFunctionality.y0domain = typeof y0 !== 'undefined' ? y0 : ZoomFunctionality.y0domain;
    },
    resize: function () {
        this.brush = this.brush.extent([[0, 0], [width, height]])
            .on("start", function () {
                d3.select(svg.node().parentNode.parentNode)
                    .style("pointer-events", "none");
                {{ overview_tooltip.hide_overview_tooltip('vis_id') }}
            })
            .on("brush", function () {
                d3.select(svg.node().parentNode.parentNode)
                    .style("pointer-events", "none");
                {{ overview_tooltip.hide_overview_tooltip('vis_id') }}
            })
            .on("end", this.brushended);

        svg.select(".brush")
            .call(this.brush)
            .selectAll("rect")
            .attr("width", width)
            .attr("height", height);
    }
};
{% endif %}
{%- endmacro %}

{% macro zoom_initialization(xDomain, yDomain) %}
{% if Component|check('Zoom') == "True" %}
ZoomFunctionality.addBrush();
ZoomFunctionality.updateDomains({{ xDomain }}, {{ yDomain }});
{% endif %}
{%- endmacro %}

{% macro zoom_resize() %}
{% if Component|check('Zoom') == "True" %}
ZoomFunctionality.resize();
{% endif %}
{%- endmacro %}

{% macro zoom_reset(xDomain, yDomain) %}
{% if Component|check('Zoom') == "True" %}
ZoomFunctionality.updateDomains({{ xDomain }}, {{ yDomain }});
ZoomFunctionality.resetZoom();
{% endif %}
{%- endmacro %}