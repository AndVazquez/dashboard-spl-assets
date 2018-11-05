{# General macro for rendering a component's structure based on its configuration #}

{% macro render_component_structure(width) %}
{% if Component|check('Exportation') == 'True' or Component|check('Controls.@type') == 'Bar' %}
var control_div = d3.select(this).append("div")
    .style("float", "left")
    .style("display", "inline-block")
    .style("top", "0px");
var icon_size = 16;
width -= icon_size;
{% endif %}
{% if Component|check('Controls.@type') == "Bar" %}
{% if Component|check('Controls.CollapseButton') == 'True' %}
control_div.append("div")
    .append("img")
    .attr("src", "{{ static }}img/options.png")
    .attr("width", icon_size)
    .attr("height", icon_size)
    .style("opacity", 0.3)
    .on("mouseover", function () {
        d3.select(this).style("cursor", "pointer");
        d3.select(this).style("opacity", 1);
    })
    .on("mouseout", function () {
        d3.select(this).style("cursor", "default");
        d3.select(this).style("opacity", 0.3);
    })
    .on("click", function () {
        var display = "none";
        if (d3.select('#{{ Component['@component_id'] }}-controls').style("display") == 'none')
            display = "block";

        d3.select('#{{ Component['@component_id'] }}-controls')
            .style("opacity", 0)
            .style("display", display)
            .transition()
            .duration(500)
            .style("opacity", 1);

        {% if Component|check('Controls.DataFilters') %}
        var display = "none";
        if (d3.select('#{{ Component['@component_id'] }}-filters').style("display") == 'none')
            display = "block";

        d3.select('#{{ Component['@component_id'] }}-filters')
            .style("opacity", 0)
            .style("display", display)
            .transition()
            .duration(500)
            .style("opacity", 1);
        {% endif %}
    });
{% endif %}
{% endif %}

{% if Component|check('Exportation') == 'True' %}
control_div.append("div")
    .append("img")
    .attr("id", "save-{{ Component['@component_id'] }}")
    .attr("src", "{{ static }}img/save.png")
    .attr("width", icon_size)
    .attr("height", icon_size)
    .style("opacity", 0.3);
{% endif %}

{% if Component|check('Controls.@type') == "Panel" %}
var vis_ratio = 3 / 4;
var panel_ratio = 1 - vis_ratio;

original_svg = d3.select(this)
    .append("div")
    .style("display", "inline-block")
    .style("float", "left")
    .style("position", "relative")
    .style("width", (width + margin.right + margin.left) * vis_ratio + "px")
    .attr("id", "vis_container_{{ Component['@component_id'] }}");

d3.select(this)
    .append("div")
    .style("display", "inline-block")
    .style("float", "right")
    .style("position", "relative")
    .style("height", height + margin.top + margin.bottom + "px")
    .style("width", (width - 50) * panel_ratio + "px")
    .style("overflow-y", "scroll")
    .style("overflow-x", "hidden")
    .attr("id", "control-panel-{{ Component['@component_id'] }}")
    .on("scroll", function () {
        d3.selectAll(".scrollable-menu")
            .transition()
            .duration(500)
            .style("display", "none")
            .style("left", "-999px")
            .style("top", "-999px");
    });

width *= vis_ratio;

{% else %}
original_svg = d3.select(this)
    .append("div")
    .style("display", "inline-block")
    .style("float", "left")
    .style("position", "relative")
    .style("width", (width + margin.right + margin.left) + "px")
    .attr("id", "vis_container_{{ Component['@component_id'] }}");
{% endif %}
{% endmacro %}

{# General macro for recalculating a component's dimensions #}

{% macro recalculate_dimensions() %}
{% if Component|check('Exportation') == 'True' or Component|check('Controls.@type') == 'Bar' %}
var icon_size = 16;
width -= icon_size;
{% endif %}
{% if Component|check('Controls.@type') == "Panel" %}
var vis_ratio = 3 / 4;
var panel_ratio = 1 - vis_ratio;

d3.select("#vis_container_{{ Component['@component_id'] }}")
    .transition()
    .duration(1000)
    .style("width", (width + margin.right + margin.left) * vis_ratio + "px");

d3.select("#control-panel-{{ Component['@component_id'] }}")
    .style("float", "right")
    .style("display", "inline_block")
    .transition()
    .duration(1000)
    .style("width", (width - 50) * panel_ratio + "px");

width *= vis_ratio;
{% else %}
d3.select("#vis_container_{{ Component['@component_id'] }}")
    .transition()
    .duration(1000)
    .style("width", (width + margin.right + margin.left) + "px");
{% endif %}
{% endmacro %}
