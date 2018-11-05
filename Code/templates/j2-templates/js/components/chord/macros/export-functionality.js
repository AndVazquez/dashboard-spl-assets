{# Macros for the chord diagram's exportation feature #}

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
        saveSvgAsPng(d3.select("#original_svg_{{ Component['@component_id'] }}").node(), "{{ Component['@component_id'] }}" + '.png',
            {backgroundColor: 'white', scale: 4});
    });
{% endif %}
{%- endmacro %}
