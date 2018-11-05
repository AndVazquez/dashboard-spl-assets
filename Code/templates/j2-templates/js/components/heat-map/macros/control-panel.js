{# Macros for rendering a heat map's control panel based on its selected features #}

{% macro render_control_panel() %}
{% if Component|check('Controls.@type') == "Panel" %}
var cp = d3.select("#control-panel-{{ Component['@component_id'] }}");

{% if Component|check('Controls.OverviewPanel') %}

cp.append("hr");
cp.append("div")
    .attr("id", "overview-{{ Component['@component_id'] }}");
cp.append("hr");

d3.select("#overview-{{ Component['@component_id'] }}")
    .append('p')
    .attr('id', 'c_detail-{{ Component['@component_id'] }}')
    .style("text-align", "center")
    .style("font-weight", "bold")
    .style("color", "black")
{% if Component|check('Controls.OverviewPanel.Description') %}
        .html("{{ Component.Controls.OverviewPanel.Description }}");
{% else %}
    .html("Información general");
{% endif %}

d3.select("#overview-{{ Component['@component_id'] }}")
    .append('p')
    .attr('id', 'dim_detail-{{ Component['@component_id'] }}')
    .html("<br>");

d3.select("#overview-{{ Component['@component_id'] }}")
    .append('p')
    .attr('id', 'value_detail-{{ Component['@component_id'] }}')
    .html("");
{% endif %}

{% if Component|check('Controls.Map') %}
cp.append("p")
    .attr("class", "control-label")
    {% if Component|check('Controls.Map.Description') %}
        .text("{{ Component.Controls.Map.Description }}");
{% else %}
    .text("Filtro por comunidad");
{% endif %}

cp.append("div")
    .attr("id", "map-control-{{ Component['@component_id'] }}");

var map = Map().width(($("#control-panel-{{ Component['@component_id'] }}").width()));
d3.selectAll("#map-control-{{ Component['@component_id'] }}").call(map);
map.query_handler(query_handler);
$(window).resize(function () {
    map.width($("#control-panel-{{ Component['@component_id'] }}").width());
});

{% endif %}

{% if Component|check('Controls.DataSelectors.Category') %}
cp.append("p")
    .attr("class", "control-label")
    .text("{{ Component.Controls.DataSelectors.Category.Description|safe }}");

cp.append("div")
    .style("width", "100%")
    .attr("class", "label_category {{ Component['@component_id'] }}")
    .append("button")
    .attr("class", "btn btn-secondary dropdown-toggle")
    .style("width", "100%")
    .attr("type", "button")
    .attr("id", 'category-{{ Component['@component_id'] }}')
    .on("click", function () {
        var bodyRect = document.body.getBoundingClientRect();
        var rect = d3.select("#category-{{ Component['@component_id'] }}")
            .node().getBoundingClientRect();
        var offset = rect.top - bodyRect.top;

        var display = d3.select("#dropdown-c-{{ Component['@component_id'] }}")
            .style("display");

        if (display == "none") {
            d3.selectAll(".scrollable-menu")
                .style("display", "none")
                .style("left", "-999px")
                .style("top", "-999px");

            d3.select("#dropdown-c-{{ Component['@component_id'] }}")
                .style("display", "block")
                .style("left", rect.left + "px")
                .style("top", offset + 35 + "px")
        }
        else {
            d3.select("#dropdown-c-{{ Component['@component_id'] }}")
                .style("display", "none")
                .style("left", "-999px")
                .style("top", "-999px")
        }
    })
    .append("text")
    .attr("text-anchor", "middle")
    .html("{{ Component.Controls.DataSelectors.Category.DataResource.DataSource.0.label|safe }}");

var dropdown = d3.select("body")
    .append("div")
    .attr("class", "dropdown-menu scrollable-menu filter-menu")
    .attr("id", "dropdown-c-{{ Component['@component_id'] }}");


dropdown.append("input")
    .attr("type", "text")
    .attr("placeholder", "\uf002")
    .attr("class", "dropdown-item searchbox")
    .attr("id", "{{ Component['@component_id'] }}-searchbox-c")
    .on("keyup", function () {
        var input, filter, ul, li, a, i;
        input = document.getElementById("{{ Component['@component_id'] }}-searchbox-c");
        filter = input.value.toUpperCase();
        var div = document.getElementById("dropdown-c-{{ Component['@component_id'] }}");
        a = div.getElementsByTagName("a");
        for (i = 0; i < a.length; i++) {
            if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
                a[i].style.display = "block";
            } else {
                a[i].style.display = "none";
            }
        }
    });

dropdown.selectAll("a")
    .data({{ Component.Controls.DataSelectors.Category.DataResource.DataSource|tojson }})
    .enter()
    .append("a")
    .attr("class", "dropdown-item")
    .attr("title", (function (d) {
        return d["label"];
    }))
    .text(function (d) {
        return d["label"];
    })
    .on("mouseover", function () {
        d3.select(this).style("cursor", "pointer");
    })
    .on("mouseout", function () {
        d3.select(this).style("cursor", "default");
    })
    .on("click", function (d) {
        d3.select("#dropdown-c-{{ Component['@component_id'] }}")
            .style("display", "none")
            .style("left", "-999px")
            .style("top", "-999px");

        d3.selectAll(".label_category.{{ Component['@component_id'] }}")
            .select("button")
            .select("text")
            .transition()
            .duration(1000)
            .text(d["label"]);

        query_handler.setGroupQuery(d['code'], 'category');
    });

{% endif %}

{% if Component|check('Controls.DataFilters') %}

cp.append("br");
cp.append("div")
    .attr("id", "data-filters-{{ Component['@component_id'] }}")
    .style("margin", "0px");

var filters = (DataFilters_{{ Component['@component_id'] }})();
filters.query_handler(query_handler);
d3.select("#data-filters-{{ Component['@component_id'] }}").call(filters);

{% endif %}

{% endif %}
{% endmacro %}