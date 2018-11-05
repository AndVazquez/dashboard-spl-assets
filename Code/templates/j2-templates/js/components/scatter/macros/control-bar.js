{# Macros for rendering a scatter diagram's control bar based on its selected features #}

{% macro render_control_bar() %}
{% if Component|check('Controls.@type') == 'Bar' %}
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

{% if Component|check('Controls.Title') %}
nav.append("a")
    .style("float", "left")
    .style("height", "100%")
    .style("padding", "5px")
    .attr("class", "navbar-brand")
    .html('{{ Component.Controls.Title }}');
{% endif %}

var content = nav.append("div")
    .attr("id", "{{ Component['@component_id'] }}-collapse")
    .style("width", "99%")
    .style("margin", "0px")
    .attr("class", "text-center")
    .append("ul")
    .attr("class", "navbar-nav navbar-filter");

{% if Component|check('Controls.DataSelectors.xAxis.@location') == 'Default' %}

content.append("li")
    .attr("class", "nav-item-filter dropdown xlabel {{ Component['@component_id'] }}")
    .append("button")
    .attr("class", "btn btn-secondary btn-sm dropdown-toggle")
    .style("margin", "5px")
    .attr("id", "dropdownXMenuButton-{{ Component['@component_id'] }}")
    .on("click", function () {
        /* CALCULAR SI SE SALE DE LA PANTALLA Y ACTUAR EN FUNCION A ELLO */

        var bodyRect = document.body.getBoundingClientRect();
        var rect = d3.select("#dropdownXMenuButton-{{ Component['@component_id'] }}")
            .node().getBoundingClientRect();
        var offset = rect.top - bodyRect.top;

        var display = d3.select("#x-dropdown-{{ Component['@component_id'] }}")
            .style("display");

        if (display == "none") {
            d3.selectAll(".scrollable-menu")
                            .style("display", "none")
                            .style("left", "-999px")
                            .style("top", "-999px");

            d3.select("#x-dropdown-{{ Component['@component_id'] }}")
                .style("display", "block")
                .style("left", rect.left + "px")
                .style("top", offset + 30 + "px")
        }
        else {
            d3.select("#x-dropdown-{{ Component['@component_id'] }}")
                .style("display", "none")
                .style("left", "-999px")
                .style("top", "-999px")
        }
    })
    .append("text")
    .attr("text-anchor", "end")
    {% if Component|check('Controls.DataSelectors.xAxis.Description') %}
        .html("{{ Component.Controls.DataSelectors.xAxis.Description }}");
{% else %}
    .html("Datos eje X");
{% endif %}

var dropdown_x = d3.select("body")
    .append("div")
    .attr("class", "dropdown-menu scrollable-menu filter-menu")
    .attr("id", "x-dropdown-{{ Component['@component_id'] }}")
    .attr("aria-labelledby", d3.select("#x-dropdown-{{ Component['@component_id'] }}")
        .attr("id"));

dropdown_x.append("input")
    .attr("type", "text")
    .attr("placeholder", "\uf002")
    .attr("class", "dropdown-item searchbox")
    .attr("id", "{{ Component['@component_id'] }}-searchbox-x")
    .on("keyup", function () {
        var input, filter, ul, li, a, i;
        input = document.getElementById("{{ Component['@component_id'] }}-searchbox-x");
        filter = input.value.toUpperCase();
        var div = document.getElementById("x-dropdown-{{ Component['@component_id'] }}");
        a = div.getElementsByTagName("a");
        for (i = 0; i < a.length; i++) {
            if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
                a[i].style.display = "block";
            } else {
                a[i].style.display = "none";
            }
        }
    });

dropdown_x.selectAll("a")
    .data({{ Component.Controls.DataSelectors.xAxis.DataResource.DataSource|tojson }})
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
        d3.select("#x-dropdown-{{ Component['@component_id'] }}")
            .style("display", "none")
            .style("left", "-999px")
            .style("top", "-999px");

        query_handler.setXQuery(d['code'], d['metric_code'], 'x', d['endpoint']);
        my.xText(d['label']);
    });
{% endif %}

{% if Component|check('Controls.DataSelectors.yAxis.@location') == 'Default' %}
content.append("li")
    .attr("class", "nav-item-filter dropdown ylabel {{ Component['@component_id'] }}")
    .append("button")
    .attr("class", "btn btn-secondary btn-sm dropdown-toggle")
    .style("margin", "5px")
    .attr("id", "dropdownYMenuButton-{{ Component['@component_id'] }}")
    .on("click", function () {
        var bodyRect = document.body.getBoundingClientRect();
        var rect = d3.select("#dropdownYMenuButton-{{ Component['@component_id'] }}")
            .node().getBoundingClientRect();
        var offset = rect.top - bodyRect.top;


        var display = d3.select("#y-dropdown-{{ Component['@component_id'] }}")
            .style("display");

        if (display == "none") {
            d3.selectAll(".scrollable-menu")
                            .style("display", "none")
                            .style("left", "-999px")
                            .style("top", "-999px");

            d3.select("#y-dropdown-{{ Component['@component_id'] }}")
                .style("display", "block")
                .style("left", rect.left + "px")
                .style("top", offset + 30 + "px")
        }
        else {
            d3.select("#y-dropdown-{{ Component['@component_id'] }}")
                .style("display", "none")
                .style("left", "-999px")
                .style("top", "-999px")
        }
    })
    .append("text")
    .attr("text-anchor", "end")
    {% if Component|check('Controls.DataSelectors.yAxis.Description') %}
        .html("{{ Component.Controls.DataSelectors.yAxis.Description }}");
{% else %}
    .html("Datos eje Y");
{% endif %}

var dropdown_y = d3.select("body")
    .append("div")
    .attr("class", "dropdown-menu scrollable-menu filter-menu")
    .attr("id", "y-dropdown-{{ Component['@component_id'] }}")
    .attr("aria-labelledby", d3.select("#y-dropdown-{{ Component['@component_id'] }}")
        .attr("id"));

dropdown_y.append("input")
    .attr("type", "text")
    .attr("placeholder", "\uf002 Buscar variable")
    .attr("class", "dropdown-item searchbox")
    .attr("id", "{{ Component['@component_id'] }}-searchbox-y")
    .on("keyup", function () {
        var input, filter, ul, li, a, i;
        input = document.getElementById("{{ Component['@component_id'] }}-searchbox-y");
        filter = input.value.toUpperCase();
        var div = document.getElementById("y-dropdown-{{ Component['@component_id'] }}");
        a = div.getElementsByTagName("a");
        for (i = 0; i < a.length; i++) {
            if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
                a[i].style.display = "block";
            } else {
                a[i].style.display = "none";
            }
        }
    });

dropdown_y.selectAll("a")
    .data({{ Component.Controls.DataSelectors.yAxis.DataResource.DataSource|tojson }})
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
        d3.select("#y-dropdown-{{ Component['@component_id'] }}")
            .style("display", "none")
            .style("left", "-999px")
            .style("top", "-999px");
        query_handler.setYQuery(d['code'], d['metric_code'], 'y', d['endpoint']);
        my.yText(d['label']);
    });
{% endif %}

{% if Component|check('Controls.DataSelectors.Radius') %}

content.append("li")
    .attr("class", "nav-item-filter dropdown rlabel {{ Component['@component_id'] }}")
    .append("button")
    .attr("class", "btn btn-secondary btn-sm dropdown-toggle")
    .style("margin", "5px")
    .attr("id", "dropdownRMenuButton-{{ Component['@component_id'] }}")
    .on("click", function () {
        var bodyRect = document.body.getBoundingClientRect();
        var rect = d3.select("#dropdownRMenuButton-{{ Component['@component_id'] }}")
            .node().getBoundingClientRect();
        var offset = rect.top - bodyRect.top;

        var display = d3.select("#r-dropdown-{{ Component['@component_id'] }}")
            .style("display");

        if (display == "none") {
            d3.selectAll(".scrollable-menu")
                            .style("display", "none")
                            .style("left", "-999px")
                            .style("top", "-999px");

            d3.select("#r-dropdown-{{ Component['@component_id'] }}")
                .style("display", "block")
                .style("left", rect.left + "px")
                .style("top", offset + 30 + "px")
        }
        else {
            d3.select("#r-dropdown-{{ Component['@component_id'] }}")
                .style("display", "none")
                .style("left", "-999px")
                .style("top", "-999px")
        }
    })
    .append("text")
    .attr("text-anchor", "end")
    {% if Component|check('Controls.DataSelectors.Radius.Description') %}
        .html("{{ Component.Controls.DataSelectors.Radius.Description }}");
{% else %}
    .html("Radio");
{% endif %}

var dropdown_r = d3.select("body")
    .append("div")
    .attr("class", "dropdown-menu scrollable-menu filter-menu")
    .attr("id", "r-dropdown-{{ Component['@component_id'] }}")
    .attr("aria-labelledby", d3.select("#r-dropdown-{{ Component['@component_id'] }}")
        .attr("id"));

dropdown_r.append("input")
    .attr("type", "text")
    .attr("placeholder", "\uf002 Buscar variable")
    .attr("class", "dropdown-item searchbox")
    .attr("id", "{{ Component['@component_id'] }}-searchbox-r")
    .on("keyup", function () {
        var input, filter, ul, li, a, i;
        input = document.getElementById("{{ Component['@component_id'] }}-searchbox-r");
        filter = input.value.toUpperCase();
        var div = document.getElementById("r-dropdown-{{ Component['@component_id'] }}");
        a = div.getElementsByTagName("a");
        for (i = 0; i < a.length; i++) {
            if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
                a[i].style.display = "block";
            } else {
                a[i].style.display = "none";
            }
        }
    });

dropdown_r.selectAll("a")
    .data({{ Component.Controls.DataSelectors.Radius.DataResource.DataSource|tojson }})
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
        d3.select("#r-dropdown-{{ Component['@component_id'] }}")
            .style("display", "none")
            .style("left", "-999px")
            .style("top", "-999px")
        query_handler.setRQuery(d['code'], d['metric_code'], 'r', d['endpoint']);
        my.rText(d['label']);
    });
{% endif %}

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
{% if Component|check('Controls.DataSelectors.Category.Description') %}
        .html("{{ Component.Controls.DataSelectors.Category.Description }}");
{% else %}
    .html("Agrupar por categorías");
{% endif %}

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

{% if Component|check('Controls.GlobalReference.xAxis') or
 Component|check('Controls.GlobalReference.yAxis') %}

content.append("li")
    .style("display", "inline")
    .attr("class", "nav-item-filter dropdown grlabel {{ Component['@component_id'] }}")
    .append("button")
    .attr("class", "btn btn-secondary btn-sm dropdown-toggle")
    .style("margin", "5px")
    .attr("id", "dropdownGRMenuButton-{{ Component['@component_id'] }}")
    .on("click", function () {
        var bodyRect = document.body.getBoundingClientRect();
        var rect = d3.select("#dropdownGRMenuButton-{{ Component['@component_id'] }}")
            .node().getBoundingClientRect();
        var offset = rect.top - bodyRect.top;

        var display = d3.select("#gr-dropdown-{{ Component['@component_id'] }}")
            .style("display");

        if (display == "none") {
            d3.selectAll(".scrollable-menu")
                            .style("display", "none")
                            .style("left", "-999px")
                            .style("top", "-999px");

            d3.select("#gr-dropdown-{{ Component['@component_id'] }}")
                .style("display", "block")
                .style("left", rect.left + "px")
                .style("top", offset + 30 + "px")
        }
        else {
            d3.select("#gr-dropdown-{{ Component['@component_id'] }}")
                .style("display", "none")
                .style("left", "-999px")
                .style("top", "-999px")
        }
    })
    .append("text")
    .attr("text-anchor", "end")
{% if Component|check('Controls.GlobalReference.Description') %}
        .html("{{ Component.Controls.GlobalReference.Description }}");
{% else %}
    .html("Referencia Global");
{% endif %}

{% if Component|check('Controls.GlobalReference.xAxis.Description') %}
var grxAxisDescr = "{{ Component.Controls.GlobalReference.xAxis.Description }}";
{% else %}
var grxAxisDescr = "Eje X";
{% endif %}

{% if Component|check('Controls.GlobalReference.yAxis.Description') %}
var gryAxisDescr = "{{ Component.Controls.GlobalReference.yAxis.Description }}";
{% else %}
var gryAxisDescr = "Eje Y";
{% endif %}

var gr_dropdown = d3.select("body")
    .append("div")
    .attr("class", "dropdown-menu scrollable-menu filter-menu")
    .attr("id", "gr-dropdown-{{ Component['@component_id'] }}")
    .attr("aria-labelledby", d3.select("#gr-dropdown-{{ Component['@component_id'] }}")
        .attr("id"));

gr_dropdown.selectAll("a")
{% if Component|check('Controls.GlobalReference.xAxis') and
Component|check('Controls.GlobalReference.yAxis') %}
    .data([{'code': 'x', 'label': grxAxisDescr}, {'code': 'y', 'label': gryAxisDescr}])
    {% elif Component|check('Controls.GlobalReference.xAxis') %}
    .data([{'code': 'x', 'label': grxAxisDescr}])
    {% elif Component|check('Controls.GlobalReference.yAxis') %}
    .data([{'code': 'y', 'label': gryAxisDescr}])
    {% endif %}
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
        d3.select("#gr-dropdown-{{ Component['@component_id'] }}")
            .style("display", "none")
            .style("left", "-999px")
            .style("top", "-999px");

        var currentOpacity = d3.select("#" + d['code'] + "Line-{{ Component['@component_id'] }}")
            .style("opacity");

        if (currentOpacity == 0)
            d3.select("#" + d['code'] + "Line-{{ Component['@component_id'] }}")
                .transition()
                .duration(700)
                .style("display", "block")
                .style("opacity", 1);
        else
            d3.select("#" + d['code'] + "Line-{{ Component['@component_id'] }}")
                .transition()
                .duration(700)
                .style("opacity", 0)
                .style("display", "none")
    });

{% endif %}
{% endif %}
{% endmacro %}