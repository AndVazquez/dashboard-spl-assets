{# Macros regarding mouse interaction with the heat map based on the selected features #}

{% macro mouseover() %}
function mouseover(d) {
    {% if Component|check('Controls.OverviewPanel') %}
    d3.select('#c_detail-{{ Component['@component_id'] }}')
        .html(d['y']);

    d3.select('#dim_detail-{{ Component['@component_id'] }}')
        .html(d['x']);

    var value;
    if (isNaN(d['value'])) {
        value = "";
    }
    else {
        value = parseFloat(d['value']).toFixed(2);
    }

    d3.select('#value_detail-{{ Component['@component_id'] }}')
        .html(description + ": " + value + d['unit']);
    {% endif %}

    {% if Component|check('Tooltip') %}
    tip.show(d);
    {% endif %}
}
{% endmacro %}

{% macro mouseout() %}
function mouseout(d) {
    {% if Component|check('Controls.OverviewPanel') %}
    d3.select('#c_detail-{{ Component['@component_id'] }}')
        {% if Component|check('Controls.OverviewPanel.Description') %}
        .html("{{ Component.Controls.OverviewPanel.Description }}");
{% else %}
    .html("Información general");
{% endif %}

    d3.select('#dim_detail-{{ Component['@component_id'] }}')
        .html("<br>");

    d3.select('#value_detail-{{ Component['@component_id'] }}')
        .html("<br>");
    {% endif %}

    {% if Component|check('Tooltip') %}
    tip.hide(d);
    {% endif %}
}
{% endmacro %}