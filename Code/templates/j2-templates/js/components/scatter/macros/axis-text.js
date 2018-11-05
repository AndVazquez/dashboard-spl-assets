{# Macros for creating and updating labels for axis description #}

{% macro render_axis_text() %}
{% if Component|check('Controls.DataSelectors.xAxis.@location') != "Axis" %}
svg.append("text")
    .attr("id", "x-text-{{ Component['@component_id'] }}")
    .attr("x", (width / 2))
    .attr("y", height + margin.top + 40)
    .style("text-anchor", "middle")
    .text(xText);
{% endif %}

{% if Component|check('Controls.DataSelectors.yAxis.@location') != "Axis" %}
svg.append("text")
    .attr("id", "y-text-{{ Component['@component_id'] }}")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text(yText);
{% endif %}
{% endmacro %}

{% macro resize_axis_text() %}
{% if Component|check('Controls.DataSelectors.xAxis.@location') != "Axis" %}
d3.select("#x-text-{{ Component['@component_id'] }}")
    .style("text-anchor", "middle")
    .transition()
    .duration(1000)
    .attr("x", (width / 2));
{% endif %}
{% endmacro %}