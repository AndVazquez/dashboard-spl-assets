/*
 * Main code for rendering the page when it's ready
 */

$(document).ready(function () {
    var rendered = false;

    if ($(window).width() > 560) {
        render_page();
        rendered = true;
    }

    $(window).resize(function () {
        if ($(window).width() > 560 && !rendered) {
            render_page();
            rendered = true;
        }

        d3.selectAll(".scrollable-menu")
            .style("display", "none")
            .style("left", "-999px")
            .style("top", "-999px");
    });
});

/*
 * render_page(): Renders the page given a specific configuration
 */

function render_page() {
    $('.loader-inner').loaders();
    d3.select("body")
        .style("pointer-events", "none");
    var query = '';

    {% for component in Components.Component %}
    {% for type, configuration in component.items() %}
    var {{ configuration['@component_id'] }}_height = $("#{{ configuration['@component_id'] }}").height();
    var {{ configuration['@component_id'] }}_width = $("#{{ configuration['@component_id'] }}").width();
    {% endfor %}
    {% endfor %}

    {% for component in Components.Component %}
    {% set outer_loop = loop %}
    {% for type, configuration in component.items() %}

    /*
     * SCATTER DIAGRAM QUERY INITIALIZATION
     */

    {% if type == 'ScatterDiagram' %}
    {% if configuration.InitialData.Category %}
    qh_{{ configuration['@component_id'] }}.initC('{{ configuration.InitialData.Category.DataResource.DataSource.code|safe }}');
    {% else %}
    qh_{{ configuration['@component_id'] }}.initC('TOTAL');
    {% endif %}
    {% if configuration|check('Controls.DataSelectors') %}
    qh_{{ configuration['@component_id'] }}.initX('{{ configuration.Controls.DataSelectors.xAxis.DataResource.DataSource.0.code|safe }}',
        '{{ configuration.Controls.DataSelectors.xAxis.DataResource.DataSource.0.metric_code|safe }}', 'x',
        '{{ configuration.Controls.DataSelectors.xAxis.DataResource.DataSource.0.endpoint|safe }}');
    qh_{{ configuration['@component_id'] }}.initY('{{ configuration.Controls.DataSelectors.yAxis.DataResource.DataSource.0.code|safe }}',
        '{{ configuration.Controls.DataSelectors.yAxis.DataResource.DataSource.0.metric_code|safe }}', 'y',
        '{{ configuration.Controls.DataSelectors.yAxis.DataResource.DataSource.0.endpoint|safe }}');
    {% else %}
    qh_{{ configuration['@component_id'] }}.initX('{{ configuration.InitialData.xAxis.DataResource.DataSource.code|safe }}',
        '{{ configuration.InitialData.xAxis.DataResource.DataSource.metric_code|safe }}', 'x',
        '{{ configuration.InitialData.xAxis.DataResource.DataSource.endpoint|safe }}');
    qh_{{ configuration['@component_id'] }}.initY('{{ configuration.InitialData.yAxis.DataResource.DataSource.code|safe }}',
        '{{ configuration.InitialData.yAxis.DataResource.DataSource.metric_code|safe }}', 'y',
        '{{ configuration.InitialData.yAxis.DataResource.DataSource.endpoint|safe }}');
    {% endif %}

    {% if configuration.InitialData.Radius %}
    qh_{{ configuration['@component_id'] }}.initR('{{ configuration.InitialData.Radius.DataResource.DataSource.code|safe }}',
        '{{ configuration.InitialData.Radius.DataResource.DataSource.metric_code|safe }}', 'r',
        '{{ configuration.InitialData.Radius.DataResource.DataSource.endpoint|safe }}');
    {% endif %}
    query = qh_{{ configuration['@component_id'] }}.getCurrentQuery();

    /*
     * HEAT MAP QUERY INITIALIZATION
     */

    {% elif type == 'Heatmap' %}
    {% if configuration.Dimensions %}
    {% if configuration|check('Controls.DataSelectors.Category') %}
    {% if configuration|check('Controls.DataSelectors.Category.DataResource.DataSource.0.code') %}
    qh_{{ configuration['@component_id'] }}.initC('{{ configuration.Controls.DataSelectors.Category.DataResource.DataSource.0.code|safe }}');
    {% else %}
    qh_{{ configuration['@component_id'] }}.initC('{{ configuration.Controls.DataSelectors.Category.DataResource.DataSource.code|safe }}');
    {% endif %}
    {% else %}
    qh_{{ configuration['@component_id'] }}.initC('TOTAL');
    {% endif %}
    {% for dim in configuration.Dimensions.Dimension %}
    qh_{{ configuration['@component_id'] }}.init_{{ dim['@dimension_id'] }}('{{ dim.DataResource.DataSource.code|safe }}',
        '{{ dim.DataResource.DataSource.metric_code|safe }}', 'hm_{{ dim['@dimension_id'] }}',
        '{{ dim.DataResource.DataSource.endpoint|safe }}');
    {% endfor %}
    {% else %}
    {% if configuration|check('Controls.DataSelectors.Category') %}
    qh_{{ configuration['@component_id'] }}.initC('{{ configuration.Controls.DataSelectors.Category.DataResource.DataSource.0.code|safe }}');
    {% else %}
    qh_{{ configuration['@component_id'] }}.initC('TOTAL');
    {% endif %}
    qh_{{ configuration['@component_id'] }}.init('{{ configuration.Dimension.DataResource.DataSource.code|safe }}',
        '{{ configuration.Dimension.DataResource.DataSource.metric_code|safe }}',
        'hm_{{ configuration.Dimension['@dimension_id'] }}', '{{ configuration.Dimension.DataResource.DataSource.endpoint|safe }}');
    {% endif %}
    query = qh_{{ configuration['@component_id'] }}.getCurrentQuery();

    /*
     * CHORD DIAGRAM QUERY INITIALIZATION
     */

    {% elif type == 'ChordDiagram' %}
    qh_{{ configuration['@component_id'] }}.initQuery('{{ configuration.InitialData.Level1.DataResource.DataSource.code|safe }}',
        '{{ configuration.InitialData.Level2.DataResource.DataSource.code|safe }}', 'c',
        '{{ configuration.InitialData.Level1.DataResource.DataSource.endpoint|safe }}');

    query = qh_{{ configuration['@component_id'] }}.getCurrentQuery();
    {% endif %}

    $.post("/api/graphql", {
        csrfmiddlewaretoken: $("input[name=csrfmiddlewaretoken]").val(),
        query: query
    }, function (rs) {
        var c_id = '{{ configuration['@component_id'] }}';

        {% if type == 'ScatterDiagram' %}

        /*
         * SCATTER DIAGRAM INSTANTIATION
         */

        var x = rs['data']['{{ configuration.InitialData.xAxis.DataResource.DataSource.endpoint|safe }}']['x'];
        var y = rs['data']['{{ configuration.InitialData.yAxis.DataResource.DataSource.endpoint|safe }}']['y'];

        {% if configuration|check('InitialData.Radius') %}
        var r = rs['data']['{{ configuration.InitialData.Radius.DataResource.DataSource.endpoint|safe }}']['r'];
        {% endif %}

        var c_{{ configuration['@component_id'] }} = ({{ configuration['@component_id'] }})()
            .width({{ configuration['@component_id'] }}_width)
            .height({{ configuration['@component_id'] }}_height)
            .query_handler(qh_{{ configuration['@component_id'] }})
            {% if configuration|check('Controls') %}
            .xText('{{ configuration.Controls.DataSelectors.xAxis.DataResource.DataSource.0.label|safe }}')
            .yText('{{ configuration.Controls.DataSelectors.yAxis.DataResource.DataSource.0.label|safe }}')
            {% else %}
            .xText('{{ configuration.InitialData.xAxis.DataResource.DataSource.label|safe }}')
            .yText('{{ configuration.InitialData.yAxis.DataResource.DataSource.label|safe }}')
            {% endif %}
            .xDescr(x['description'])
            .xUnit(x['unit'])
            .yDescr(y['description'])
            .yUnit(y['unit'])
            {% if configuration|check('Controls.GlobalReference.yAxis') %}
            .yLineVal(rs['data']['{{ configuration.InitialData.yAxis.DataResource.DataSource.endpoint|safe }}']
                ['global_y']['values'][0]['value'])
            {% endif %}
            {% if configuration|check('Controls.GlobalReference.xAxis') %}
            .xLineVal(rs['data']['{{ configuration.InitialData.xAxis.DataResource.DataSource.endpoint|safe }}']
                ['global_x']['values'][0]['value'])
            {% endif %}
            {% if configuration.InitialData.Radius %}
            {% if configuration|check('Controls') %}
            .rText('{{ configuration.Controls.DataSelectors.Radius.DataResource.DataSource.0.label|safe }}')
            {% else %}
            .rText('{{ configuration.InitialData.Radius.DataResource.DataSource.label|safe }}')
            {% endif %}
            {% endif %}
            {% if configuration.InitialData.Category %}
            {% if configuration|check('Controls') %}
            .cText('{{ configuration.Controls.DataSelectors.Category.DataResource.DataSource.0.label|safe }}')
            {% endif %}
            {% else %}
            .cText('TOTAL')
            {% endif %}
            {% if configuration|check('InitialData.Radius') %}
            .rDescr(r['description'])
            .r_max(r['max']).r_min(r['min'])
            .data(x['values'], y['values'], r['values'])
            {% else %}
            .data(x['values'], y['values'])
            {% endif %}
            .x_max(x['max']).y_max(y['max'])
            .y_min(y['min']).x_min(x['min']);

        d3.select("#" + c_id).call(c_{{ configuration['@component_id'] }});
        qh_{{ configuration['@component_id'] }}.setViz(c_{{ configuration['@component_id'] }});

        $(window).resize(function () {
            c_{{ configuration['@component_id'] }}
                .dimensions($("#" + c_id).width(),
                    $("#" + c_id).height());
        });

        {% elif type == 'Heatmap' %}

        /*
         * HEATMAP INSTANTIATION
         */


        var c_{{ configuration['@component_id'] }} = ({{ configuration['@component_id'] }})()
            .margin_top(30)
            .margin_bottom(0)
            .query_handler(qh_{{ configuration['@component_id'] }})
            .width({{ configuration['@component_id'] }}_width)
            .height({{ configuration['@component_id'] }}_height)
            {% if configuration.Dimensions %}
            {% for dim in configuration.Dimensions.Dimension %}
            .data_{{ dim['@dimension_id'] }}(rs['data']['{{ dim.DataResource.DataSource.endpoint }}']['hm_{{ dim['@dimension_id'] }}'])
            {% endfor %}
            {% else %}
            .data(rs['data']['{{ configuration.Dimension.DataResource.DataSource.endpoint }}']['hm_{{ configuration.Dimension['@dimension_id'] }}'])
            {% endif %}
            .cScale(d3.interpolateGnBu);
        d3.select("#" + c_id).call(c_{{ configuration['@component_id'] }});
        qh_{{ configuration['@component_id'] }}.setViz(c_{{ configuration['@component_id'] }});

        $(window).resize(function () {
            c_{{ configuration['@component_id'] }}
                .dimensions($("#" + '{{ configuration['@component_id'] }}').width(),
                    $("#" + '{{ configuration['@component_id'] }}').height());
        });

        {% elif type == 'ChordDiagram' %}


        /*
         * CHORD DIAGRAM INSTANTIATION
         */

        var data = rs['data']['{{ configuration.InitialData.Level1.DataResource.DataSource.endpoint|safe }}']['c'];

        var c_{{ configuration['@component_id'] }} = ({{ configuration['@component_id'] }})()
            .width({{ configuration['@component_id'] }}_width)
            .height({{ configuration['@component_id'] }}_height)
            .query_handler(qh_{{ configuration['@component_id'] }})
            .level1_description(data[0]['descriptionL2'])
            .level2_description(data[0]['descriptionL1'])
            .data(data);

        d3.select("#" + c_id).call(c_{{ configuration['@component_id'] }});
        qh_{{ configuration['@component_id'] }}.setViz(c_{{ configuration['@component_id'] }});

        $(window).resize(function () {
            c_{{ configuration['@component_id'] }}
                .dimensions($("#" + '{{ configuration['@component_id'] }}').width(),
                    $("#" + '{{ configuration['@component_id'] }}').height());
        });
        {% endif %}
    });
    {% endfor %}
    {% endfor %}

    $(document).ajaxStop(function () {
        d3.select("body")
            .style("pointer-events", "auto");

        $('.loader.main').css('display', 'none');
        $('#root-container').css('opacity', 1);
    });

    /*
     * PAGE DATA FILTER INSTANTIATION
     */

    {% if DataFilter %}
    var c_{{ DataFilter['@component_id'] }} = DataFilter();
    d3.select("#{{ DataFilter['@component_id'] }}").call(c_{{ DataFilter['@component_id'] }});

    {% for component in Components.Component %}
    {% for type, configuration in component.items() %}
    c_{{ DataFilter['@component_id'] }}.add_handler(qh_{{ configuration['@component_id'] }});
    {% endfor %}
    {% endfor %}

    {% endif %}
}