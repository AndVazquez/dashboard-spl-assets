/**
 VARIABLE DECLARATION AND INITIALIZATION (if needed for some functionality)
 **/

    {% macro variable_definition() %}
var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("display", "none")
        .style("opacity", 0);
{% if Component.Controls.Map.Filter %}
var fill_color = "#2b8cbe";
var select_color = "#7bccc4";
//var deselect_color = "#fc9272";
var deselect_color = "#7bccc4";
var selected;
{% endif %}
{% if Component.Controls.Map.Information %}
var data;
{% endif %}
{%- endmacro %}

{% macro variable_initialization() %}
{% if Component.Controls.Map.Information %}
var colorScale = d3.scaleThreshold()
    .domain(d3.range(data['min'], data['max'] * 1.2, 100));

var cScale = d3.scaleSequential(d3.interpolateYlGnBu)
    .domain([data['min'], data['max'] * 1.2]);

var cRange = [];

colorScale.domain().forEach(function (d) {
    cRange.push(cScale(d));
});
colorScale.range(cRange);
{% endif %}
{%- endmacro %}

/**
 FUNCTION DEFINITIONS
 **/

{% macro function_definitions() %}
{% if Component.Controls.Map.Information %}
my.data = function (value) {
    if (!arguments.length) return value;
    data = value;
    return my;
};
{% endif %}
{%- endmacro %}

/**
 MOUSE-MOVE FUNCTIONALITY
 **/

{% macro mousemove(type) %}
{% if Component.Controls.Map.Filter %}
function mousemove(d, i) {
    tooltip.transition()
        .duration(200)
        .style("display", "block")
        .style("opacity", 1);

    {% if type == "path" %}
    var name = d.properties["NAME_1"];
    {% elif type == "rect" %}
    var name = i == 0 ? "Ceuta" : "Melilla";
    {% endif %}

    d3.select(this).style("cursor", "pointer");

    tooltip.html(name + "<br/>")
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
}
{% elif Component.Controls.Map.Information %}
function mousemove(d, i) {
    {% if type == "path" %}
    var name = d.properties["NAME_1"];
    {% elif type == "rect" %}
    var name = i == 0 ? "Ceuta" : "Melilla";
    {% endif %}

    tooltip.transition()
        .duration(200)
        .style("display", "block")
        .style("opacity", 1);
    for (var j in data['values']) {
        {%  if type == "path" %}
        if (data['values'][j].label == d.properties.ID_OEEU.toString()) {
            {% elif type == "rect" %}
            if (data['values'][j].label == (i == 0 ? 18 : 19)) {
                {% endif %}
                break;
            }
        }
        tooltip.html(name + "<br/>" + parseInt(data['values'][j].value) + " " + data.description + "<br/>")
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 48) + "px");
    }
    {% endif %}
    {%- endmacro %}

    /**
     MOUSE-OVER FUNCTIONALITY
     **/

    {% macro mouseover(type) %}
    {% if Component.Controls.Map.Filter %}
    function mouseover(d, i) {
        d3.select(this).style("cursor", "pointer");
        if (selected === this) {
            d3.select(this)
                .transition()
                .style("fill", deselect_color);
        }
        else {
            d3.select(this)
                .transition()
                .style("fill", select_color);
        }
    }

    {% else %}
    function mouseover() {
        return;
    }

    {% endif %}
    {%- endmacro %}

    /**
     MOUSE-OUT FUNCTIONALITY
     **/

    {% macro mouseout(type) %}
    {% if Component.Controls.Map.Filter %}
    function mouseout() {
        d3.select(this).style("cursor", "default");
        if (selected !== this) {
            d3.select(this)
                .transition()
                .style("fill", fill_color);
        }
        else {
            d3.select(this).style("fill", select_color);
        }

        tooltip.transition()
            .duration(500)
            .style("display", "none")
            .style("opacity", 0);
    }

    {% elif Component.Controls.Map.Information %}
    function mouseout() {
        tooltip.transition()
            .duration(500)
            .style("display", "none")
            .style("opacity", 0);
    }

    {% endif %}
    {%- endmacro %}

    /**
     CLICK FUNCTIONALITY
     **/

    {% macro click(type) %}
    {% if Component.Controls.Map.Filter %}
    function click(d, i) {
        if (this !== selected) {
            d3.select(this.parentNode).selectAll("rect")
                .style("fill", fill_color);
            d3.select(this.parentNode).selectAll("path")
                .style("fill", fill_color);

            selected = this;
            d3.select(this).style("fill", select_color);
            {% if type == "rect" %}
            query_handler.setFilter("CCAAEstudiante", (i == 0 ? 18 : 19));
            {% elif type == "path" %}
            query_handler.setFilter("CCAAEstudiante", d.properties["ID_OEEU"]);
            {% endif %}
        }
        else {
            d3.select(this.parentNode).selectAll("rect")
                .style("fill", fill_color);
            d3.select(this.parentNode).selectAll("path")
                .style("fill", fill_color);
            query_handler.removeFilter("CCAAEstudiante");

            selected = null;
        }
    }

    {% else %}
    function click() {
        return;
    }

    {% endif %}
    {%- endmacro %}

    /**
     FILL FUNCTIONALITY
     **/

    {% macro fill(type) %}
    {% if Component.Controls.Map.Filter %}
    function fill() {
        return fill_color;
    }

    {% elif Component.Controls.Map.Information %}
    function fill(d, i) {
        for (var j in data['values']) {
            {%  if type == "path" %}
            if (data['values'][j].label == d.properties.ID_OEEU.toString()) {
                {% elif type == "rect" %}
                if (data['values'][j].label == (i == 0 ? 18 : 19)) {
                    {% endif %}
                    break;
                }
            }
            return colorScale(data['values'][j].value);
        }
{% endif %}
{%- endmacro %}