{# Macros for rendering a chord diagram's control bar based on its selected features #}

{% macro render_control_bar() %}
{% if Component|check('Controls.@type') == "Bar" %}
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
    .style("width", "99%")
    .style("margin", "0px")
    .attr("class", "text-center")
    .append("ul")
    .attr("class", "navbar-nav navbar-filter");

{% if Component|check('Controls.DataSelectors.Level1') %}
content.append("li")
    .attr("class", "nav-item-filter dropdown l1label {{ Component['@component_id'] }}")
    .append("button")
    .attr("class", "btn btn-secondary btn-sm dropdown-toggle")
    .style("margin", "5px")
    .attr("id", "dropdownL1MenuButton-{{ Component['@component_id'] }}")
    .on("click", function () {
        var bodyRect = document.body.getBoundingClientRect();
        var rect = d3.select("#dropdownL1MenuButton-{{ Component['@component_id'] }}")
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
                .style("top", offset + 30 + "px")
        }
        else {
            d3.select("#l1-dropdown-{{ Component['@component_id'] }}")
                .style("display", "none")
                .style("left", "-999px")
                .style("top", "-999px")
        }
    })
    .append("text")
    .attr("text-anchor", "end")
    {% if Component|check('Controls.DataSelectors.Level1.Description') %}
        .text("{{ Component.Controls.DataSelectors.Level1.Description }}")
{% else %}
    .text("Datos nivel 1 (izquierda)");
{% endif %}

var l1_dropdown = d3.select("body")
    .append("div")
    .attr("class", "dropdown-menu scrollable-menu filter-menu")
    .attr("id", "l1-dropdown-{{ Component['@component_id'] }}")
    .attr("aria-labelledby", d3.select("#l1-dropdown-{{ Component['@component_id'] }}")
        .attr("id"));

l1_dropdown.append("input")
    .attr("type", "text")
    .attr("placeholder", "\uf002")
    .attr("class", "dropdown-item searchbox")
    .attr("id", "{{ Component['@component_id'] }}-searchbox-l1")
    .on("keyup", function () {
        var input, filter, ul, li, a, i;
        input = document.getElementById("{{ Component['@component_id'] }}-searchbox-l1");
        filter = input.value.toUpperCase();
        var div = document.getElementById("l1-dropdown-{{ Component['@component_id'] }}");
        a = div.getElementsByTagName("a");
        for (i = 0; i < a.length; i++) {
            if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
                if(a[i].innerHTML.toUpperCase().localeCompare(level2_description.toUpperCase()) == 0)
                    a[i].style.display = "none";
                else
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

        query_handler.setL2Query(d['code'], 'c');
        my.level1_description(d['label']);

        {% if Component|check('Controls.DataSelectors.Level2') %}
        var filter = d['label'].toUpperCase();
        var div = document.getElementById("l2-dropdown-{{ Component['@component_id'] }}");
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

{% if Component|check('Controls.DataSelectors.Level2') %}
content.append("li")
    .attr("class", "nav-item-filter dropdown l2label {{ Component['@component_id'] }}")
    .append("button")
    .attr("class", "btn btn-secondary btn-sm dropdown-toggle")
    .style("margin", "5px")
    .attr("id", "dropdownL2MenuButton-{{ Component['@component_id'] }}")
    .on("click", function () {
        /* CALCULAR SI SE SALE DE LA PANTALLA Y ACTUAR EN FUNCION A ELLO */

        var bodyRect = document.body.getBoundingClientRect();
        var rect = d3.select("#dropdownL2MenuButton-{{ Component['@component_id'] }}")
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
                .style("top", offset + 30 + "px")
        }
        else {
            d3.select("#l2-dropdown-{{ Component['@component_id'] }}")
                .style("display", "none")
                .style("left", "-999px")
                .style("top", "-999px")
        }
    })
    .append("text")
    .attr("text-anchor", "end")
    {% if Component|check('Controls.DataSelectors.Level2.Description') %}
        .text("{{ Component.Controls.DataSelectors.Level2.Description }}")
{% else %}
    .text("Datos nivel 2 (derecha)");
{% endif %}

var l2_dropdown = d3.select("body")
    .append("div")
    .attr("class", "dropdown-menu scrollable-menu filter-menu")
    .attr("id", "l2-dropdown-{{ Component['@component_id'] }}")
    .attr("aria-labelledby", d3.select("#l2-dropdown-{{ Component['@component_id'] }}")
        .attr("id"));

l2_dropdown.append("input")
    .attr("type", "text")
    .attr("placeholder", "\uf002")
    .attr("class", "dropdown-item searchbox")
    .attr("id", "{{ Component['@component_id'] }}-searchbox-l2")
    .on("keyup", function () {
        var input, filter, ul, li, a, i;
        input = document.getElementById("{{ Component['@component_id'] }}-searchbox-l2");
        filter = input.value.toUpperCase();
        var div = document.getElementById("l2-dropdown-{{ Component['@component_id'] }}");
        a = div.getElementsByTagName("a");
        for (i = 0; i < a.length; i++) {
            if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
                if(a[i].innerHTML.toUpperCase().localeCompare(level1_description.toUpperCase()) == 0)
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

        query_handler.setL1Query(d['code'], 'c');
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

{% if Component|check('Controls.DataFilters') %}
var filters_div = d3.select(this).append("div")
    .attr("id", "{{ Component['@component_id'] }}-filters")
    {% if Component|check('Controls.CollapseButton') == 'True' %}
    .style("display", "none")
    {% else %}
    .style("display", "block");
{% endif %}

var filters = (DataFilters_{{ Component['@component_id'] }})();
filters.query_handler(query_handler);
d3.select("#{{ Component['@component_id'] }}-filters").call(filters);

{% endif %}
{% endif %}
{% endmacro %}