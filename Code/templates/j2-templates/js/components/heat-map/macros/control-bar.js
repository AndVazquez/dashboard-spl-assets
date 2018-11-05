{# Macros for rendering a heat map's control bar based on its selected features #}

{% macro render_control_bar() %}
{% if Component|check('Controls.@type') == 'Bar'%}
var nav = d3.select(this).append("div")
    .attr("id", "{{ Component['@component_id'] }}-controls")
    {% if Component|check('Controls.CollapseButton') == 'True' %}
    .style("display", "none")
    {% else %}
    .style("display", "block")
    {% endif %}
    .attr("margin-bottom", "10px")
    .style("z-index", "900")
    .style("width", "100%")
    .attr("class", "viz-navbar scroll");

nav.append("a")
    .style("float", "left")
    .style("height", "100%")
    .style("padding", "5px")
    .attr("class", "navbar-brand")
    .html("Controles");

var content = nav.append("div")
    .attr("id", "{{ Component['@component_id'] }}-collapse")
    .style("width", "98%")
    .style("margin", "0px")
    .attr("class", "text-center")
    .append("ul")
    .attr("class", "navbar-nav navbar-filter");

{% if Component|check('Controls.DataSelectors.Category') %}
content.append("li")
    .attr("class", "nav-item-filter dropdown clabel {{ Component['@component_id'] }}")
    .append("button")
    .attr("class", "btn btn-secondary btn-sm dropdown-toggle")
    .style("margin", "5px")
    .attr("id", "dropdownCMenuButton-{{ Component['@component_id'] }}")
    .on("click", function () {
        var bodyRect = document.body.getBoundingClientRect();
        var rect = d3.select("#dropdownCMenuButton-{{ Component['@component_id'] }}")
            .node().getBoundingClientRect();
        var offset = rect.top - bodyRect.top;

        var display = d3.select("#c-dropdown-{{ Component['@component_id'] }}")
            .style("display");

        if (display == "none") {
            d3.selectAll(".scrollable-menu")
                            .style("display", "none")
                            .style("left", "-999px")
                            .style("top", "-999px");

            d3.select("#c-dropdown-{{ Component['@component_id'] }}")
                .style("display", "block")
                .style("left", rect.left + "px")
                .style("top", offset + 30 + "px")
        }
        else {
            d3.select("#c-dropdown-{{ Component['@component_id'] }}")
                .style("display", "none")
                .style("left", "-999px")
                .style("top", "-999px")
        }
    })
    .append("text")
    .attr("text-anchor", "end")
    .html("Agrupar por categorías");

var dropdown_c = d3.select("body")
    .append("div")
    .attr("class", "dropdown-menu scrollable-menu filter-menu")
    .attr("id", "c-dropdown-{{ Component['@component_id'] }}")
    .attr("aria-labelledby", d3.select("#c-dropdown-{{ Component['@component_id'] }}")
        .attr("id"));

dropdown_c.append("input")
    .attr("type", "text")
    .attr("placeholder", "\uf002")
    .attr("class", "dropdown-item searchbox")
    .attr("id", "{{ Component['@component_id'] }}-searchbox-c")
    .on("keyup", function () {
        var input, filter, ul, li, a, i;
        input = document.getElementById("{{ Component['@component_id'] }}-searchbox-c");
        filter = input.value.toUpperCase();
        var div = document.getElementById("c-dropdown-{{ Component['@component_id'] }}");
        a = div.getElementsByTagName("a");
        for (i = 0; i < a.length; i++) {
            if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
                a[i].style.display = "block";
            } else {
                a[i].style.display = "none";
            }
        }
    });

dropdown_c.selectAll("a")
    .data({{ Component.Controls.DataSelectors.Category.DataResource.DataSource|tojson }})
    .enter()
    .append("a")
    .attr("class", "dropdown-item")
    .attr("title", (function (d) {
        return d['label'];
    }))
    .text(function (d) {
        return d['label'];
    })
    .on("mouseover", function () {
        d3.select(this).style("cursor", "pointer");
    })
    .on("mouseout", function () {
        d3.select(this).style("cursor", "default");
    })
    .on("click", function (d) {
        d3.select("#c-dropdown-{{ Component['@component_id'] }}")
            .style("display", "none")
            .style("left", "-999px")
            .style("top", "-999px");

        query_handler.setGroupQuery(d['code'], d['metric_code'], 'c');
    });
{% endif %}

{% if Component|check('Controls.DataFilters') %}

var filters_div = d3.select(this).append("div")
    .attr("id", "{{ Component['@component_id'] }}-filters")
    {% if Component|check('Controls.CollapseButton') == 'True' %}
    .style("display", "none")
    {% else %}
    .style("display", "block")
{% endif %}

var filters = (DataFilters_{{ Component['@component_id'] }})();
filters.query_handler(query_handler);
d3.select("#{{ Component['@component_id'] }}-filters").call(filters);

{% endif %}

{% endif %}
{% endmacro %}