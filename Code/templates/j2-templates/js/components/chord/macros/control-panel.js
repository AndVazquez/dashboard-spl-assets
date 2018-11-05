{# Macros for rendering a chord diagrams's control panel based on its selected features #}

{% macro render_control_panel() %}
{% if Component|check('Controls.@type') == "Panel" %}
var cp = d3.select("#control-panel-{{ Component['@component_id'] }}");

{% if Component|check('Controls.OverviewPanel') %}

cp.append("hr");
cp.append("div")
    .attr("id", "overview-{{ Component['@component_id'] }}");
cp.append("hr");
{% endif %}

{% if Component|check('Controls.DataSelectors.Level1') %}
cp.append("p")
    .attr("class", "control-label")
    {% if Component|check('Controls.DataSelectors.Level1.Description') %}
        .text("{{ Component.Controls.DataSelectors.Level1.Description }}")
{% else %}
    .text("Seleccionar datos nivel 1 (izquierda)");
{% endif %}

cp.append("div")
    .style("width", "100%")
    .attr("class", "l1label {{ Component['@component_id'] }}")
    .append("button")
    .attr("class", "btn btn-secondary dropdown-toggle")
    .style("width", "100%")
    .attr("type", "button")
    .attr("id", 'level1-{{ Component['@component_id'] }}')
    .on("click", function () {
        var bodyRect = document.body.getBoundingClientRect();
        var rect = d3.select("#level1-{{ Component['@component_id'] }}")
            .node().getBoundingClientRect();
        var offset = rect.top - bodyRect.top;

        var display = d3.select("#l1-dropdown-{{ Component['@component_id'] }}")
            .style("display");

        if (display == "none") {
            d3.selectAll(".scrollable-menu")
                .style("display", "none")
                .style("left", "-999px")
                .style("top", "-999px");

            d3.select("#l1-dropdown-{{ Component['@component_id'] }}")
                .style("display", "block")
                .style("left", rect.left + "px")
                .style("top", offset + 35 + "px")
        }
        else {
            d3.select("#l1-dropdown-{{ Component['@component_id'] }}")
                .style("display", "none")
                .style("left", "-999px")
                .style("top", "-999px")
        }
    })
    .append("text")
    .attr("text-anchor", "middle")
    {% if Component|check('Controls.DataSelectors.Level1.Description') %}
        .text("{{ Component.Controls.DataSelectors.Level1.Description }}")
{% else %}
    .text("Datos nivel 1 (izquierda)");
{% endif %}

var l1_dropdown = d3.select("body")
    .append("div")
    .attr("class", "dropdown-menu scrollable-menu filter-menu")
    .attr("id", "l1-dropdown-{{ Component['@component_id'] }}");


l1_dropdown.append("input")
    .attr("type", "text")
    .attr("placeholder", "\uf002")
    .attr("class", "dropdown-item searchbox")
    .attr("id", "searchbox-l1-{{ Component['@component_id'] }}")
    .on("keyup", function () {
        var input, filter, ul, li, a, i;
        input = document.getElementById("searchbox-l1-{{ Component['@component_id'] }}");
        filter = input.value.toUpperCase();
        var div = document.getElementById("l1-dropdown-{{ Component['@component_id'] }}");
        a = div.getElementsByTagName("a");
        for (i = 0; i < a.length; i++) {
            if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
                a[i].style.display = "block";
            } else {
                a[i].style.display = "none";
            }
        }
    });

l1_dropdown.selectAll("a")
    .data({{ Component.Controls.DataSelectors.Level1.DataResource.DataSource|tojson }})
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
        d3.select("#l1-dropdown-{{ Component['@component_id'] }}")
            .style("display", "none")
            .style("left", "-999px")
            .style("top", "-999px");

        d3.selectAll(".l1label.{{ Component['@component_id'] }}")
            .select("button")
            .select("text")
            .transition()
            .duration(1000)
            .text(d["label"]);

        query_handler.setL2Query(d['code'], d['metric_code'], 'l1');
        my.level1_description(d['label']);

        {% if Component|check('Controls.DataSelectors.Level2') %}
        var filter = d['label'].toUpperCase();
        var div = document.getElementById("l2-dropdown-{{ Component['@component_id'] }}");
        var a = div.getElementsByTagName("a");
        for (var i = 0; i < a.length; i++) {
            if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
                if(a[i].innerHTML.toUpperCase().indexOf(level2_description.toUpperCase()) > -1)
                    a[i].style.display = "none";
                else
                    a[i].style.display = "block";
            } else {
                a[i].style.display = "block";
            }
        }
        {% endif %}
    });

{% endif %}

cp.append("br");

{% if Component|check('Controls.DataSelectors.Level2') %}

cp.append("p")
    .attr("class", "control-label")
    {% if Component|check('Controls.DataSelectors.Level2.Description') %}
        .text("{{ Component.Controls.DataSelectors.Level2.Description }}")
{% else %}
    .text("Seleccionar datos nivel 2 (derecha)");
{% endif %}

cp.append("div")
    .style("width", "100%")
    .attr("class", "l2label {{ Component['@component_id'] }}")
    .append("button")
    .attr("class", "btn btn-secondary dropdown-toggle")
    .style("width", "100%")
    .attr("type", "button")
    .attr("id", 'level2-{{ Component['@component_id'] }}')
    .on("click", function () {
        var bodyRect = document.body.getBoundingClientRect();
        var rect = d3.select("#level2-{{ Component['@component_id'] }}")
            .node().getBoundingClientRect();
        var offset = rect.top - bodyRect.top;

        var display = d3.select("#l2-dropdown-{{ Component['@component_id'] }}")
            .style("display");

        if (display == "none") {
            d3.selectAll(".scrollable-menu")
                .style("display", "none")
                .style("left", "-999px")
                .style("top", "-999px");

            d3.select("#l2-dropdown-{{ Component['@component_id'] }}")
                .style("display", "block")
                .style("left", rect.left + "px")
                .style("top", offset + 35 + "px")
        }
        else {
            d3.select("#l2-dropdown-{{ Component['@component_id'] }}")
                .style("display", "none")
                .style("left", "-999px")
                .style("top", "-999px")
        }
    })
    .append("text")
    .attr("text-anchor", "middle")
    {% if Component|check('Controls.DataSelectors.Level2.Description') %}
        .text("{{ Component.Controls.DataSelectors.Level2.Description }}")
{% else %}
    .text("Datos nivel 2 (derecha)");
{% endif %}

var l2_dropdown = d3.select("body")
    .append("div")
    .attr("class", "dropdown-menu scrollable-menu filter-menu")
    .attr("id", "l2-dropdown-{{ Component['@component_id'] }}");

l2_dropdown.append("input")
    .attr("type", "text")
    .attr("placeholder", "\uf002")
    .attr("class", "dropdown-item searchbox")
    .attr("id", "searchbox-l2-{{ Component['@component_id'] }}")
    .on("keyup", function () {
        var input, filter, ul, li, a, i;
        input = document.getElementById("searchbox-l2-{{ Component['@component_id'] }}");
        filter = input.value.toUpperCase();
        var div = document.getElementById("l2-dropdown-{{ Component['@component_id'] }}");
        a = div.getElementsByTagName("a");
        for (i = 0; i < a.length; i++) {
            if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
                if(a[i].innerHTML.toUpperCase().indexOf(level1_description.toUpperCase()) > -1)
                    a[i].style.display = "none";
                else
                    a[i].style.display = "block";
            } else {
                a[i].style.display = "none";
            }
        }
    });

l2_dropdown.selectAll("a")
    .data({{ Component.Controls.DataSelectors.Level2.DataResource.DataSource|tojson }})
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
        d3.select("#l2-dropdown-{{ Component['@component_id'] }}")
            .style("display", "none")
            .style("left", "-999px")
            .style("top", "-999px");

        d3.selectAll(".l2label.{{ Component['@component_id'] }}")
            .select("button")
            .select("text")
            .transition()
            .duration(1000)
            .text(d["label"]);

        query_handler.setL1Query(d['code'], d['metric_code'], 'l2');
        my.level2_description(d['label']);

        {% if Component|check('Controls.DataSelectors.Level1') %}
        var filter = d['label'].toUpperCase();
        var div = document.getElementById("l1-dropdown-{{ Component['@component_id'] }}");
        var a = div.getElementsByTagName("a");
        for (var i = 0; i < a.length; i++) {
            if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
                a[i].style.display = "none";
            } else {
                a[i].style.display = "block";
            }
        }
        {% endif %}
    });
{% endif %}

{% if Component|check('Controls.Map') %}

cp.append("br");

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