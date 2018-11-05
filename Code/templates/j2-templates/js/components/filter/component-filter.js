/* Component to allow filtering on a particular component's data */

function DataFilters_{{ Component['@component_id'] }}() {
    var data;
    var query_handler;

    function my(selection) {
        selection.each(function () {
            var nav = d3.select(this).append("div")
                .attr("id", "component-filter-{{ Component['@component_id'] }}")
                .style("z-index", "1000")
                .style("width", "100%")
                .style("height", "auto")
                .attr("class", "navbar navbar-expand-lg viz-navbar scroll");

            {% if Component|check('Controls.DataFilters.Title') %}

            nav.append("a")
                .style("float", "left")
                .style("height", "100%")
                .style("padding", "5px")
                .attr("class", "navbar-brand")
                .html("{{ Component.Controls.DataFilters.Title }}");
            {% endif %}

            var content = nav.append("div")
                .attr("id", "filter-collapse-{{ Component['@component_id'] }}")
                .style("height", "100%")
                .style("margin", "0px")
                .attr("class", "text-center")
                .append("ul")
                .attr("class", "navbar-nav navbar-filter");

            {% for x, values in Component.Controls.DataFilters.FilterGroup.DataResource.items() %}
            {% for y in values %}
            render_filters(content, '{{ y.FilterCode }}', '{{ y.Label }}', {{ y.Option|tojson }});
            {% endfor %}
            {% endfor %}
        });

        function render_filters(content, filter_code, label, options) {
            content.append("li")
                .attr("class", "nav-item-filter dropdown filter-" + filter_code + " {{ Component['@component_id'] }}")
                .append("button")
                .attr("class", "btn btn-secondary btn-sm dropdown-toggle")
                .style("margin", "5px")
                .attr("data-toggle", "dropdown")
                .attr("aria-haspopup", "true")
                .attr("aria-expanded", "false")
                .attr("id", "dropdownFilterButton-" + filter_code + "-{{ Component['@component_id'] }}")
                .on("click", function () {
                    var bodyRect = document.body.getBoundingClientRect();
                    var rect = d3.select("#dropdownFilterButton-" + filter_code + "-{{ Component['@component_id'] }}")
                        .node().getBoundingClientRect();
                    var offset = rect.top - bodyRect.top;

                    var display = d3.select("#filter-dropdown-" + filter_code + "-{{ Component['@component_id'] }}")
                        .style("display");

                    if (display == "none") {
                        d3.selectAll(".scrollable-menu")
                            .style("display", "none")
                            .style("left", "-999px")
                            .style("top", "-999px");

                        d3.select("#filter-dropdown-" + filter_code + "-{{ Component['@component_id'] }}")
                            .style("display", "block")
                            .style("left", rect.left + "px")
                            .style("top", offset + 35 + "px")
                    }
                    else {
                        d3.select("#filter-dropdown-" + filter_code + "-{{ Component['@component_id'] }}")
                            .style("display", "none")
                            .style("left", "-999px")
                            .style("top", "-999px")
                    }
                })
                .append("text")
                .attr("text-anchor", "end")
                .html(label);

            var dropdown = d3.select("body")
                .append("div")
                .attr("class", "dropdown-menu scrollable-menu filter-menu")
                .attr("id", "filter-dropdown-" + filter_code + "-{{ Component['@component_id'] }}")
                .attr("aria-labelledby", d3.select(".dropdown.filter-" + filter_code + ".{{ Component['@component_id'] }}")
                    .attr("id"));

            dropdown.append("input")
                .attr("type", "text")
                .attr("placeholder", "\uf002")
                .attr("class", "dropdown-item searchbox")
                .attr("id", "{{ Component['@component_id'] }}-searchbox-filter-" + filter_code)
                .on("keyup", function () {
                    var input, filter, ul, li, a, i;
                    input = document.getElementById("{{ Component['@component_id'] }}-searchbox-filter-" + filter_code);
                    filter = input.value.toUpperCase();
                    var div = document.getElementById("filter-dropdown-" + filter_code + "-{{ Component['@component_id'] }}");
                    a = div.getElementsByTagName("a");
                    for (i = 0; i < a.length; i++) {
                        if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
                            a[i].style.display = "block";
                        } else {
                            a[i].style.display = "none";
                        }
                    }
                });

            dropdown.append("a")
                .attr("class", "dropdown-item")
                .html("<b>X</b>")
                .on("mouseover", function () {
                    d3.select(this).style("cursor", "pointer");
                })
                .on("mouseout", function () {
                    d3.select(this).style("cursor", "default");
                })
                .on("click", function () {
                    d3.select("#filter-dropdown-" + filter_code + "-{{ Component['@component_id'] }}")
                        .style("display", "none")
                        .style("left", "-999px")
                        .style("top", "-999px");

                    query_handler.removeFilter(filter_code);
                    d3.select("#dropdownFilterButton-" + filter_code + "-{{ Component['@component_id'] }}")
                        .style("background-color", "white")
                        .style("border-color", "grey")
                        .style("color", "grey")
                        .select("text")
                        .html(label);
                });

            dropdown.selectAll("a.dropdown-item.options")
                .data(options)
                .enter()
                .append("a")
                .attr("class", "dropdown-item options")
                .attr("title", (function (d) {
                    return d['Label'];
                }))
                .text(function (d) {
                    return d['Label'];
                })
                .on("mouseover", function () {
                    d3.select(this).style("cursor", "pointer");
                })
                .on("mouseout", function () {
                    d3.select(this).style("cursor", "default");
                })
                .on("click", function (d) {
                    d3.select("#filter-dropdown-" + filter_code + "-{{ Component['@component_id'] }}")
                        .style("display", "none")
                        .style("left", "-999px")
                        .style("top", "-999px");

                    query_handler.setFilter(filter_code, d['Value']);
                    d3.select("#dropdownFilterButton-" + filter_code + "-{{ Component['@component_id'] }}")
                        .style("background-color", "#2B8CBE")
                        .style("border-color", "#2B8CBE")
                        .style("color", "white")
                        .select("text")
                        .html(d['Label']);
                });
        }
    }

    my.query_handler = function (qh) {
        query_handler = qh;
    };

    return my
}