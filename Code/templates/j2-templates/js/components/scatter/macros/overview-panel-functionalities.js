{# Macros for creating and updating an informative panel #}

{% macro update_overview() %}
{% if Component|check('Controls.OverviewPanel') %}

d3.select('.c_detail-{{ Component['@component_id'] }}')
    .style("text-align", "center")
    .style("font-weight", "bold")
    .style("color", "black")
    .text(cText);

d3.select('.x_detail-{{ Component['@component_id'] }}')
    .text(xText);

d3.select('.y_detail-{{ Component['@component_id'] }}')
    .text(yText);

{% if Component|check('InitialData.Radius') %}
d3.select('.r_detail-{{ Component['@component_id'] }}')
    .text(rText);
{% endif %}

{% endif %}
{%- endmacro %}