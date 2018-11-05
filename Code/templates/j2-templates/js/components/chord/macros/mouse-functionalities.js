{# Macros regarding mouse interaction with the chord diagram based on the selected features #}

{% import 'templates/j2-templates/js/components/chord/macros/overview-tooltip.js' as overview_tooltip with context %}

{% macro mouseover() %}
function mouseover(d, i) {
    d3.select(this).style("cursor", "pointer");

    {{ overview_tooltip.show_overview_tooltip() }}
    {{ overview_tooltip.update_overview_tooltip() }}

    var sel = wrapper.selectAll("g.group.{{ Component['@component_id'] }}")
        .filter(function (d) {
            return d.selected === true;
        });

    if (sel._groups[0].length == 0) {
        wrapper.selectAll("path.chord.{{ Component['@component_id'] }}")
            .filter(function (d) {
                return d.source.index !== i && d.target.index !== i && names[d.source.index] !== "";
            })
            .transition()
            .style("opacity", opacityLow);
    }

    d3.select(this)
        .selectAll("path")
        .style("fill", "#658BCD")
        .style("stroke", "#658BCD");
}
{% endmacro %}

{% macro mouseout() %}
function mouseout(d, i) {

    var sel = wrapper.selectAll("g.group.{{ Component['@component_id'] }}")
        .filter(function (d) {
            return d.selected === true;
        });

    if (sel._groups[0].length == 0) {
        wrapper.selectAll("path.chord.{{ Component['@component_id'] }}")
            .filter(function (d) {
                return d.source.index !== i && d.target.index !== i && names[d.source.index] !== "";
            })
            .transition()
            .style("opacity", opacityDefault);
    }
    if (!d.selected) {
        {{ overview_tooltip.hide_overview_tooltip() }}
        d3.select(this)
            .selectAll("path")
            .style("fill", "#8FD3E4")
            .style("stroke", "#8FD3E4");
    }
}
{% endmacro %}

{% macro click() %}
function click(d, i) {
    if (d.selected) {
        d3.selectAll(".chord-" + d.index + ".{{ Component['@component_id'] }}")
            .transition()
            .style("opacity", opacityLow)
            .style("fill", "#A0A0A0");

        d3.select(this)
            .selectAll("path")
            .style("fill", "#8FD3E4")
            .style("stroke", "#8FD3E4");
    }
    else {
        d3.selectAll(".chord-" + d.index + ".{{ Component['@component_id'] }}")
            .transition()
            .style("opacity", opacityDefault)
            .style("fill", "#c9afff");

        d3.select(this)
            .selectAll("path")
            .style("fill", "#658BCD")
            .style("stroke", "#658BCD");
    }
    d.selected = d.selected ? false : true;

    var sel = wrapper.selectAll("g.group.{{ Component['@component_id'] }}")
        .filter(function (d) {
            return d.selected === true;
        });

    if (sel._groups[0].length == 0) {
        wrapper.selectAll("path.chord.{{ Component['@component_id'] }}")
            .filter(function (d) {
                return names[d.source.index] !== "";
            })
            .transition()
            .style("opacity", opacityDefault)
            .style("fill", "#A0A0A0");
    }
}
{% endmacro %}