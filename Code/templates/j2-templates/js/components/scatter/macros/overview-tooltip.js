{# Macros for creating and updating an informative tooltip #}

{% macro create_overview_tooltip(vis_id) %}
{% if Component|check('Tooltip.@type') == "Complete" %}
d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .attr("id", "overview-tooltip-" + {{ vis_id }})
    .style("display", "none")
    .style("opacity", 0);

d3.select("#overview-tooltip-" + {{ vis_id }})
    .append('p')
    .attr('class', 'c_detail-{{ Component['@component_id'] }}')
    .style("text-align", "center")
    .style("font-weight", "bold")
    .style("color", "black")
    .text(cText);

{% if Component|check('InitialData.Radius') %}
d3.select("#overview-tooltip-" + {{ vis_id }})
    .append('p')
    .attr('class', 'r_detail-{{ Component['@component_id'] }}')
    .text(rText);
{% endif %}

d3.select("#overview-tooltip-" + {{ vis_id }})
    .append('p')
    .attr('class', 'x_detail-{{ Component['@component_id'] }}')
    .text(xText);


d3.select("#overview-tooltip-" + {{ vis_id }})
    .append('p')
    .attr('class', 'y_detail-{{ Component['@component_id'] }}')
    .text(yText);

{% endif %}
{% endmacro %}

{% macro show_overview_tooltip(vis_id) %}
{% if Component|check('Tooltip.@type') == "Complete" %}
d3.select("#overview-tooltip-" + {{ vis_id }})
    .style("display", "block")
    .style("left", (d3.event.pageX - 250) + "px")
    .style("top", (d3.event.pageY - 150) + "px")
    .style("opacity", 1);
{% else %}
tip.show(d);
{% endif %}
{% endmacro %}

{% macro hide_overview_tooltip(vis_id) %}
{% if Component|check('Tooltip.@type') == "Complete" %}
d3.select("#overview-tooltip-" + {{ vis_id }})
    .style("display", "none")
    .style("left", "-999px")
    .style("top", "-999px")
    .style("opacity", 0);
{% else %}
tip.hide(d);
{% endif %}
{% endmacro %}
