{# Macros for rendering a scatter diagram's control panel based on its selected features #}

{% macro render_control_panel(query_handler, vis_id) %}
{% if Component|check('Controls.@type') == "Panel" %}

var cp = d3.select("#control-panel-{{ Component['@component_id'] }}");

{% for key, value in Component.Controls.items() %}
{% if key == "OverviewPanel" %}
cp.append("hr");
cp.append("div")
    .attr("id", "overview-" + {{ vis_id }});
cp.append("hr");

d3.select("#overview-" + {{ vis_id }})
    .append('p')
    .attr('class', 'c_detail-{{ Component['@component_id'] }}')
    .style("text-align", "center")
    .style("font-weight", "bold")
    .style("color", "black")
    .text(cText);

{% if Component|check('InitialData.Radius') %}
d3.select("#overview-" + {{ vis_id }})
    .append('p')
    .attr('class', 'r_detail-{{ Component['@component_id'] }}')
    .text(rText);
{% endif %}

d3.select("#overview-" + {{ vis_id }})
    .append('p')
    .attr('class', 'x_detail-{{ Component['@component_id'] }}')
    .text(xText);

d3.select("#overview-" + {{ vis_id }})
    .append('p')
    .attr('class', 'y_detail-{{ Component['@component_id'] }}')
    .text(yText);


{% elif key == 'DataFilters' %}

cp.append("br");
cp.append("div")
    .attr("id", "data-filters-" + {{ vis_id }});
cp.append("br");cp.append("br");cp.append("br");

var filters = (DataFilters_{{ Component['@component_id'] }})();
filters.query_handler(query_handler);
d3.select("#data-filters-" + {{ vis_id }}).call(filters);

{% elif key == "DataSelectors" %}
{% for key2, value2 in Component.Controls[key].items() %}
cp.append("div")
    .attr("id", "control-{{ key2 }}-" + {{ vis_id }});
{% endfor %}
{% elif key == "Map" %}

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
{% endfor %}

{% for key, value in Component.Controls.DataSelectors.items() %}

{% if value|check('@location') == 'Default'  %}
d3.select('#control-{{ key }}-{{ Component['@component_id'] }}')
    .append("p")
    .attr("class", "control-label")
    .text("{{ Component.Controls.DataSelectors[key].Description|safe }}");

d3.select('#control-{{ key }}-{{ Component['@component_id'] }}')
    .append("div")
    .style("width", "100%")
    .attr("class", "nav-item-filter label_{{ key }} " + {{ vis_id }})
    .append("button")
    .attr("class", "btn btn-secondary dropdown-toggle")
    .style("width", "100%")
    .attr("id", '{{ key }}-{{ Component['@component_id'] }}')
    .on("click", function () {
        var bodyRect = document.body.getBoundingClientRect();
        var rect = d3.select("#{{ key }}-{{ Component['@component_id'] }}")
            .node().getBoundingClientRect();
        var offset = rect.top - bodyRect.top;

        var display = d3.select("#dropdown-{{ key }}-{{ Component['@component_id'] }}")
            .style("display");

        if (display == "none") {
            d3.selectAll(".scrollable-menu")
                .style("display", "none")
                .style("left", "-999px")
                .style("top", "-999px");

            d3.select("#dropdown-{{ key }}-{{ Component['@component_id'] }}")
                .style("display", "block")
                .style("left", rect.left + "px")
                .style("top", offset + 35 + "px")
        }
        else {
            d3.select("#dropdown-{{ key }}-{{ Component['@component_id'] }}")
                .style("display", "none")
                .style("left", "-999px")
                .style("top", "-999px")
        }
    })
    .append("text")
    .attr("text-anchor", "middle")
    .html("{{ Component.Controls.DataSelectors[key].DataResource.DataSource.0.label|safe }}");

var dropdown = d3.select("body")
    .append("div")
    .attr("class", "dropdown-menu scrollable-menu filter-menu")
    .attr("id", "dropdown-{{ key }}-" + {{ vis_id }});

dropdown.append("input")
    .attr("type", "text")
    .attr("placeholder", "\uf002")
    .attr("class", "dropdown-item searchbox")
    .attr("id", "{{ Component['@component_id'] }}-searchbox-{{ key }}")
    .on("keyup", function () {
        var input, filter, ul, li, a, i;
        input = document.getElementById("{{ Component['@component_id'] }}-searchbox-{{ key }}");
        filter = input.value.toUpperCase();
        var div = document.getElementById("dropdown-{{ key }}-" + {{ vis_id }});
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
    .data({{ Component.Controls.DataSelectors[key].DataResource.DataSource|tojson }})
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
        d3.select("#dropdown-{{ key }}-" + {{ vis_id }})
            .style("display", "none")
            .style("left", "-999px")
            .style("top", "-999px");

        d3.selectAll(".label_{{ key }}." + {{ vis_id }})
            .select("button")
            .select("text")
            .transition()
            .duration(1000)
            .text(d["label"]);

        {% if key == 'Category' %}
        my.cText(d["label"]);
        ({{ query_handler }}).setGroupQuery.call({{ query_handler }}, d['code'], d['metric_code'], '{{ key }}');
        {% elif key == 'Radius' %}
        my.rText(d["label"]);
        ({{ query_handler }}).setRQuery.call({{ query_handler }}, d['code'], d['metric_code'], '{{ key }}', d['endpoint']);
        {% elif key == 'xAxis' %}
        my.xText(d["label"]);
        ({{ query_handler }}).setXQuery.call({{ query_handler }}, d['code'], d['metric_code'], '{{ key }}', d['endpoint']);
        {% elif key == 'yAxis' %}
        my.yText(d["label"]);
        ({{ query_handler }}).setYQuery.call({{ query_handler }}, d['code'], d['metric_code'], '{{ key }}', d['endpoint']);
        {% endif %}
    });
{% endif %}
{% endfor %}


{% if Component|check('Controls.GlobalReference.xAxis') or
 Component|check('Controls.GlobalReference.yAxis') %}

cp.append("div")
    .attr('id', 'control-gr-{{ Component['@component_id'] }}')
    .append("p")
    .attr("class", "control-label")
    {% if Component|check('Controls.GlobalReference.Description') %}
    .text("{{ Component.Controls.GlobalReference.Description }}");
{% else %}
.text("Referencia Global");
{% endif %}

d3.select('#control-gr-{{ Component['@component_id'] }}')
    .append("div")
    .style("width", "100%")
    .attr("class", "label_gr {{ Component['@component_id'] }}")
    .append("button")
    .attr("class", "btn btn-secondary dropdown-toggle")
    .style("width", "100%")
    .attr("type", "button")
    .attr("id", 'gr-{{ Component['@component_id'] }}')
    .on("click", function () {
        var bodyRect = document.body.getBoundingClientRect();
        var rect = d3.select("#gr-{{ Component['@component_id'] }}")
            .node().getBoundingClientRect();
        var offset = rect.top - bodyRect.top;

        var display = d3.select("#dropdown-gr-{{ Component['@component_id'] }}")
            .style("display");

        if (display == "none") {
            d3.selectAll(".scrollable-menu")
                .style("display", "none")
                .style("left", "-999px")
                .style("top", "-999px");

            d3.select("#dropdown-gr-{{ Component['@component_id'] }}")
                .style("display", "block")
                .style("left", rect.left + "px")
                .style("top", offset + 35 + "px")
        }
        else {
            d3.select("#dropdown-gr-{{ Component['@component_id'] }}")
                .style("display", "none")
                .style("left", "-999px")
                .style("top", "-999px")
        }
    })
    .append("text")
    .attr("text-anchor", "middle")
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
    .attr("id", "dropdown-gr-" + {{ vis_id }})
    .attr("aria-labelledby", 'gr');

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
        d3.select("#dropdown-gr-" + {{ vis_id }})
            .style("display", "none")
            .style("left", "-999px")
            .style("top", "-999px");

        d3.selectAll(".label_gr.{{ Component['@component_id'] }}")
            .select("button")
            .select("text")
            .transition()
            .duration(1000)
            .text(d["label"]);

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
                .style("display", "none")
                .transition()
                .duration(700)
                .style("opacity", 0);

    });

{% endif %}


{% endif %}
{%- endmacro %}