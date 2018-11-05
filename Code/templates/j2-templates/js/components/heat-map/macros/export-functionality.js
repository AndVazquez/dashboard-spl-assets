{# Macros for the heat map's exportation feature #}

{% macro export() %}
{% if Component|check('Exportation') == 'True' %}
d3.select("#save-{{ Component['@component_id'] }}")
    .on("mouseover", function () {
        d3.select(this).style("cursor", "pointer");
        d3.select(this).style("opacity", 1);
    })
    .on("mouseout", function () {
        d3.select(this).style("cursor", "default");
        d3.select(this).style("opacity", 0.3);
    })
    .on("click", function () {
        d3.select(this).style("opacity", 0);
        d3.selectAll(".icon").style("opacity", 0);
        {% if Component.Dimensions %}
        {% for dim in Component.Dimensions.Dimension %}
        saveSvgAsPng(d3.select("#original-svg-{{ Component['@component_id'] }}-{{ dim['@dimension_id'] }}")
                .select("svg").node(),
            "{{ Component['@component_id'] }}-{{ dim['@dimension_id'] }}" + '.png',
            {backgroundColor: 'white', scale: 4});
        {% endfor %}
        {% else %}
        saveSvgAsPng(d3.select("#original-svg-{{ Component['@component_id'] }}-heatmap")
                .select("svg").node(),
            "{{ Component['@component_id'] }}" + '.png',
            {backgroundColor: 'white', scale: 4});
        {% endif %}
        d3.selectAll(".icon").style("opacity", 0.6);
    });
{% endif %}
{%- endmacro %}