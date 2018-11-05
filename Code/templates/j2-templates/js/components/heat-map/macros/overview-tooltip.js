{# Macros for creating and updating an informative tooltip #}

{% macro create_tooltip() %}
{% if Component|check('Tooltip') %}
var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-20, 0])
    .html(function (d) {
        var f = d3.format(".3");
        if (isNaN(d['value'])) {
            return "<span style='color:white'>" + description + "</span><br><br>" +
                "<span>" + d['y'] + "</span><br><br>" +
                "<span>" + d['x'] + ":</span> <span style='color:white'> No hay datos </span>";
        }
        return "<span style='color:white'>" + description + "</span><br><br>" +
            "<span>" + d['y'] + "</span><br><br>" +
            "<span>" + d['x'] + "</span> <span style='color:white'>" + f(d['value']) + d['unit'] + "</span>";
    });
original_svg.call(tip);
{% endif %}
{% endmacro %}