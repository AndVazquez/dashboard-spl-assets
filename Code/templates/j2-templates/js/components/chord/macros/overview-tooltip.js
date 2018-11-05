{# Macros for creating and updating an informative tooltip #}

{% macro create_overview_tooltip() %}
{% if Component|check('Tooltip.@type') == 'Complete' %}
d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .attr("id", "overview-tooltip-{{ Component['@component_id'] }}")
    .style("display", "none")
    .style("opacity", 0);

d3.select("#overview-tooltip-{{ Component['@component_id'] }}")
    .append('p')
    .attr('id', 'c_detail-{{ Component['@component_id'] }}')
    .style("text-align", "center")
    .style("font-weight", "bold")
    .style("color", "black");

d3.select("#overview-tooltip-{{ Component['@component_id'] }}")
    .append('p')
    .style("text-align", "left")
    .style("padding", "3px")
    .attr('id', 'value_detail-{{ Component['@component_id'] }}')
    .style("color", "black");

{% else %}
d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .attr("id", "overview-tooltip-{{ Component['@component_id'] }}")
    .style("display", "none")
    .style("opacity", 0);

d3.select("#overview-tooltip-{{ Component['@component_id'] }}")
    .append('p')
    .attr('id', 'c_detail-{{ Component['@component_id'] }}')
    .style("text-align", "center")
    .style("font-weight", "bold")
    .style("color", "black");
{% endif %}
{% endmacro %}

{% macro update_overview_tooltip() %}
{% if Component|check('Tooltip.@type') == 'Complete' %}
var total_group_elements;
d3.select(this).each(function (d) {
    total_group_elements = d.value;
});
d3.select("#c_detail-{{ Component['@component_id'] }}")
    .html(names[i]);
d3.select("#value_detail-{{ Component['@component_id'] }}")
    .html(function () {
        var html_text = "";

        wrapper.selectAll("path.chord.{{ Component['@component_id'] }}")
            .filter(function (d) {
                return d.source.index == i || d.target.index == i && names[d.source.index] !== "";
            })
            .each(function (d) {
                if (d.target.index == i) {
                    var perc = parseFloat((d.source.value / total_group_elements) * 100).toFixed(2);
                    html_text += names[d.source.index] + ": " + d.source.value + " (" + perc + " %)" + "<br>";
                }
                else if (d.source.index == i) {
                    var perc = parseFloat((d.target.value / total_group_elements) * 100).toFixed(2);
                    html_text += names[d.target.index] + ": " + d.target.value + " (" + perc + " %)" + "<br>";
                }
            });

        return html_text;
    });
{% else %}
d3.select("#c_detail-{{ Component['@component_id'] }}")
    .html(names[i]);
{% endif %}
{% endmacro %}

{% macro show_overview_tooltip() %}
{% if Component|check('Tooltip') %}
d3.select("#overview-tooltip-{{ Component['@component_id'] }}")
    .style("display", "block")
    .style("left", (d3.event.pageX + 20) + "px")
    .style("top", (d3.event.pageY - 20) + "px")
    .style("opacity", 1);
{% endif %}
{% endmacro %}

{% macro hide_overview_tooltip() %}
{% if Component|check('Tooltip') %}
d3.select("#overview-tooltip-{{ Component['@component_id'] }}")
    .style("display", "none")
    .style("opacity", 0);
{% endif %}
{% endmacro %}
