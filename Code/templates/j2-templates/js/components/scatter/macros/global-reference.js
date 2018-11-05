{# Macros for defining, initializing and updating a global line reference on the scatter diagram #}

{% macro variable_definition() %}
{% if Component|check('Controls.GlobalReference.xAxis') %}
var xLineVal = 0; var updateXLine;
{% endif %}
{% if Component|check('Controls.GlobalReference.yAxis') %}
var yLineVal = 0; var updateYLine;
{% endif %}
{%- endmacro %}

/**
 * Line initialization
 */

{% macro init_line(yScale, xScale, yLineVal, xLineVal, tooltipScatterDiagram, vis_id) %}
{% if Component|check('Controls.GlobalReference.xAxis') %}
svg.append("line")
    .attr("id", "xLine-" + {{ vis_id }})
    .style("stroke", "#2b8cbe")
    .style("stroke-width", "2px")
    .style("stroke-dasharray", ("3, 3"))
    .attr("x1", {{ xScale }}({{ xLineVal }}))
    .attr("y1", 0)
    .attr("x2", {{ xScale }}({{ xLineVal }}))
    .attr("y2", height)
    .style("opacity", 0)
    .style("display", "none")
    .on("mouseover", function () {
        ({{ tooltipScatterDiagram }}).transition()
            .duration(200)
            .style("display", "block")
            .style("opacity", 1);

        ({{ tooltipScatterDiagram }}).html("Valor global (no desagregado): " + parseFloat({{ xLineVal }}).toFixed(2) + "<br/>")
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function () {
        ({{ tooltipScatterDiagram }}).transition()
            .duration(200)
            .style("display", "none")
            .style("opacity", 0);
    });
{% endif %}
{% if Component|check('Controls.GlobalReference.yAxis') %}
svg.append("line")
    .attr("id", "yLine-" + {{ vis_id }})
    .style("stroke", "#2b8cbe")
    .style("stroke-dasharray", ("3, 3"))
    .style("stroke-width", "2px")
    .attr("x1", 0)
    .attr("y1", {{ yScale }}({{ yLineVal }}))
    .attr("x2", width)
    .attr("y2", {{ yScale }}({{ yLineVal }}))
    .style("opacity", 0)
    .on("mouseover", function () {
        ({{ tooltipScatterDiagram }}).transition()
            .duration(200)
            .style("display", "block")
            .style("opacity", 1);

        ({{ tooltipScatterDiagram }}).html("Valor global (no desagregado): " + parseFloat({{ yLineVal }}).toFixed(2) + "<br/>")
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function () {
        ({{ tooltipScatterDiagram }}).transition()
            .duration(200)
            .style("display", "none")
            .style("opacity", 0);
    });
{% endif %}
{%- endmacro %}

/**
 * Line resize
 */

{% macro line_resize(xScale, xLineVal, yScale, yLineVal, vis_id) %}
{% if Component|check('Controls.GlobalReference.xAxis') %}
d3.select("#xLine-" + {{ vis_id }})
    .transition()
    .duration(1000)
    .attr("x1", {{ xScale }}({{ xLineVal }}))
    .attr("y1", 0)
    .attr("x2", {{ xScale }}({{ xLineVal }}))
    .attr("y2", height);
{% endif %}
{% if Component|check('Controls.GlobalReference.yAxis') %}
d3.select("#yLine-" + {{ vis_id }})
    .transition()
    .duration(1000)
    .attr("x1", 0)
    .attr("y1", {{ yScale }}({{ yLineVal }}))
    .attr("x2", width)
    .attr("y2", {{ yScale }}({{ yLineVal }}));
{% endif %}
{%- endmacro %}

/**
 * Line getters/setters
 */

{% macro x_line_setter() %}
{% if Component|check('Controls.GlobalReference.xAxis') %}
my.xLineVal = function (value) {
    if (!arguments.length) return xLineVal;
    xLineVal = value;
    if (typeof updateXLine === 'function') updateXLine();
    return my;
};
{% endif %}
{%- endmacro %}

{% macro y_line_setter() %}
{% if Component|check('Controls.GlobalReference.yAxis') %}
my.yLineVal = function (value) {
    if (!arguments.length) return yLineVal;
    yLineVal = value;
    if (typeof updateYLine === 'function') updateYLine();
    return my;
};
{% endif %}
{%- endmacro %}

/**
 * Line update functions
 */

{% macro x_line_update(xScale, xLineVal, vis_id) %}
{% if Component|check('Controls.GlobalReference.xAxis') %}
updateXLine = function () {
    d3.select("#xLine-" + {{ vis_id }})
        .transition()
        .duration(1000)
        .attr("x1", {{ xScale }}({{ xLineVal }}))
        .attr("y1", 0)
        .attr("x2", {{ xScale }}({{ xLineVal }}))
        .attr("y2", height);
};
{% endif %}
{%- endmacro %}

{% macro y_line_update(yScale, yLineVal, vis_id) %}
{% if Component|check('Controls.GlobalReference.yAxis') %}
updateYLine = function () {
    d3.select("#yLine-" + {{ vis_id }})
        .transition()
        .duration(1000)
        .attr("x1", 0)
        .attr("y1", {{ yScale }}({{ yLineVal }}))
        .attr("x2", width)
        .attr("y2", {{ yScale }}({{ yLineVal }}));
};
{% endif %}
{%- endmacro %}