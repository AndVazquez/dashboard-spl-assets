{# Macro for rendering a component's title #}

{% macro render_chart_title() %}
{% if Component.Title %}
    d3.select(this).append("h3")
        .style("text-align", "center")
        .text("{{ Component.Title }}");
{% endif %}
{% endmacro %}