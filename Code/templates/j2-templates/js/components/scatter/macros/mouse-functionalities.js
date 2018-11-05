{# Macros regarding mouse interaction with the scatter diagram based on the selected features #}

{% import 'templates/j2-templates/js/components/scatter/macros/overview-tooltip.js' as overview_tooltip with context %}

/**
 *  MOUSE-OVER
 **/

{% macro mouseover(colorGlobal, xText, yText, rText, vis_id) %}
{% if Component|check('Controls.OverviewPanel') or Component|check('Tooltip.@type') == "Complete" %}
function mouseover(d) {
    d3.selectAll(".dot." + {{ vis_id }})
        .filter(function (e) {
            return e['c'] !== d['c'];
        })
        .transition()
        .style("opacity", .1);
    
    {{ overview_tooltip.show_overview_tooltip('vis_id') }}

    d3.selectAll('.c_detail-' + {{ vis_id }})
        .transition()
        .style("color", {{ colorGlobal}}(d['c']))
        .style("text-align", "center")
        .style("font-weight", "bold")
        .text(d['c']);

    var x = parseFloat(parseFloat(d['x']).toFixed(2));
    if (isNaN(d['x']))
        x = "No hay datos";
    d3.selectAll('.x_detail-' + {{ vis_id }})
        .transition()
        .text({{ xText }} +": " + x + " " + xUnit);

    var y = parseFloat(parseFloat(d['y']).toFixed(2));
    if (isNaN(d['y']))
        y = "No hay datos";
    d3.selectAll('.y_detail-' + {{ vis_id }})
        .transition()
        .text({{ yText }} +": " + y + " " + yUnit);

    var r = parseFloat(parseFloat(d['r']).toFixed(2));
    if (isNaN(d['r']))
        r = "No hay datos";
    d3.selectAll('.r_detail-' + {{ vis_id }})
        .transition()
        .text({{ rText }} +": " + r);

    return;
}
{% else %}
function mouseover(d) {
    {{ overview_tooltip.show_overview_tooltip('vis_id') }}
}
{% endif %}
{%- endmacro %}

/**
 *  MOUSE-OUT
 **/

{% macro mouseout(cText, xText, yText, rText, vis_id) %}
{% if Component|check('Controls.OverviewPanel') or Component|check('Tooltip.@type') == "Complete" %}
function mouseout(d) {
    d3.selectAll(".dot." + {{ vis_id }})
        .transition()
        .style("opacity", 1);

    {{ overview_tooltip.hide_overview_tooltip('vis_id') }}

    d3.selectAll('.c_detail-' + {{ vis_id }})
        .transition()
        .style("text-align", "center")
        .style("font-weight", "bold")
        .style("color", "black")
        .text({{ cText }});

    d3.selectAll('.x_detail-' + {{ vis_id }})
        .transition()
        .text({{ xText }});

    d3.selectAll('.y_detail-' + {{ vis_id }})
        .transition()
        .text({{ yText }});

    d3.selectAll('.r_detail-' + {{ vis_id }})
        .transition()
        .text({{ rText }});

    return;
}
{% else %}
function mouseover(d) {
    {{ overview_tooltip.hide_overview_tooltip('vis_id') }}
}
{% endif %}
{%- endmacro %}
