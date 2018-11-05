/*
 * Query handler in charge of connecting a heat map instance with the OEEU's GraphQL API
 */

var qh_{{ Component['@component_id'] }} = {
    viz: null,
    queries: 0,
    currentPromise: $.Deferred().resolve().promise(),
    querySchema: function (metricName, gCode, tCode, alias) {
        if (metricName == 'oneLevelGroupedAverage' || metricName == 'oneLevelGroupedPercentage'
            || metricName == 'oneLevelEffectiveness') {
            var query = alias + ':' + metricName
                + '(level1:"' + gCode + '", target:"' + tCode + '")' +
                '{ min, max, dimension, values {y: label, x: target, value, icon, unit}}';
        }

        return query;
    },
    filterSchema: function (filters, filter_len) {
        var filter_string = '';
        var i = 1;

        Object.keys(filters).forEach(function (key) {
            if (i == 1) {
                filter_string = '('
            }

            filter_string += key + ': ' + filters[key];

            if ((filter_len - i) == 0) {
                filter_string += ')'
            }
            else {
                filter_string += ','
            }

            i++;
        });

        return filter_string;
    },
    query: {},
    group: '',
    filter: {},
    initFilter: function (key, val) {
        this.filter[key] = val;
    },
    initC: function (code) {
        this.group = code;
    },
    {% if Component.Dimensions %}
    {% for dim in Component.Dimensions.Dimension %}
    init_{{ dim['@dimension_id'] }}: function (code, metric, alias, edition) {
        var subquery = {'metric': metric, 'alias': alias, 'code': code, 'edition': edition};
        this.query['v_{{ dim['@dimension_id'] }}'] = subquery;
    },
    {% endfor %}
    {% else %}
    init: function (code, metric, alias, edition) {
        var subquery = {'metric': metric, 'alias': alias, 'code': code, 'edition': edition};
        this.query['v'] = subquery;
    },
    {% endif %}
    getCurrentQuery: function () {
        {% if Component.Dimensions %}
        {% for dim in Component.Dimensions.Dimension %}
        var alias{{ dim['@dimension_id'] }} = this.query['v_{{ dim['@dimension_id'] }}']['alias'];
        var query{{ dim['@dimension_id'] }} = this.querySchema(this.query['v_{{ dim['@dimension_id'] }}']['metric'], this.group,
            this.query['v_{{ dim['@dimension_id'] }}']['code'], alias{{ dim['@dimension_id'] }});
        {% endfor %}
        var edition = this.query['v_{{ Component.Dimensions.Dimension.0['@dimension_id'] }}']['edition'];
        {% else %}
        var alias = this.query['v']['alias'];
        var edition = this.query['v']['edition'];
        var query = this.querySchema(this.query['v']['metric'], this.group, this.query['v']['code'], alias);
        {% endif %}

        var filter_len = Object.keys(this.filter).length;
        if (filter_len != 0)
            var filter = this.filterSchema(this.filter, filter_len);
        else
            var filter = '';

        var total = 'query { ' + edition + filter + '{'
            {% if Component.Dimensions %}
            {% for dim in Component.Dimensions.Dimension %}
            + query{{ dim['@dimension_id'] }} + ','
            {% endfor %}
            {% else %}
            + query + ','
            {% endif %}
            + '}}';

        return total;
    },
    setViz: function (v) {
        this.viz = v;
    },
    setFilter: function (key, val) {
        this.filter[key] = val;
        this.buildQuery();
    },
    removeFilter: function (key) {
        if (key in this.filter) {
            delete this.filter[key];
            this.buildQuery();
        }
    },
    setGroupQuery: function (code, _, _) {
        this.group = code;
        this.buildQuery();
    },
    buildQuery: function () {
        this.queries += 1;

        d3.select('#vis_container_{{ Component['@component_id'] }}')
            .style("pointer-events", "none")
            .selectAll("svg")
            .style("opacity", 0.3);

        d3.select('#main-loader-{{ Component['@component_id'] }}')
            .style("display", "block")
            .style("opacity", 1);


        d3.select('#loader-{{ Component['@component_id'] }}')
            .style("display", "block")
            .style("opacity", 1);

        {% if Component.Dimensions %}
        {% for dim in Component.Dimensions.Dimension %}
        var alias{{ dim['@dimension_id'] }} = this.query['v_{{ dim['@dimension_id'] }}']['alias'];
        var query{{ dim['@dimension_id'] }} = this.querySchema(this.query['v_{{ dim['@dimension_id'] }}']['metric'], this.group,
            this.query['v_{{ dim['@dimension_id'] }}']['code'], alias{{ dim['@dimension_id'] }});
        {% endfor %}
        var edition = this.query['v_{{ Component.Dimensions.Dimension.0['@dimension_id'] }}']['edition'];
        var metric = this.query['v_{{ Component.Dimensions.Dimension.0['@dimension_id'] }}']['metric'];
        {% else %}
        var alias = this.query['v']['alias'];
        var edition = this.query['v']['edition'];
        var metric = this.query['v']['metric'];
        var query = this.querySchema(this.query['v']['metric'], this.group,
            this.query['v']['code'], alias);
        {% endif %}

        var filter_len = Object.keys(this.filter).length;
        if (filter_len != 0)
            var filter = this.filterSchema(this.filter, filter_len);
        else
            var filter = '';

        var total = 'query { ' + edition + filter + '{'
            {% if Component.Dimensions %}
            {% for dim in Component.Dimensions.Dimension %}
            + query{{ dim['@dimension_id'] }} + ','
            {% endfor %}
            {% else %}
            + query + ','
            {% endif %}
            + '}}';

        var i_viz = this.viz;

        var dataQueryPromise = $.ajax({
            url: '/api/graphql',
            type: 'POST',
            data: {
                csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').prop('value'),
                query: total
            }
        });

        var thenPromise = this.currentPromise.then(
            function () {
                return dataQueryPromise;
            },
            function () {
                return dataQueryPromise;
            });

        thenPromise.done(function (rs) {
            {% if Component.Dimensions %}
            {% for dim in Component.Dimensions.Dimension %}
            var d{{ dim['@dimension_id'] }} = rs['data'][edition]['hm_{{ dim['@dimension_id'] }}'];
            i_viz.data_{{ dim['@dimension_id'] }}(d{{ dim['@dimension_id'] }});
            {% endfor %}
            {% else %}
            var d = rs['data'][edition]['hm_{{ Component.Dimension['@dimension_id'] }}'];
            i_viz.data(d);
            {% endif %}

            qh_{{ Component['@component_id'] }}.queries -= 1;

            if (qh_{{ Component['@component_id'] }}.queries == 0) {
                qh_{{ Component['@component_id'] }}.queries_end_handler();
            }
        });
        thenPromise.fail(function () {
            console.log('Failure');
        });
    },
    queries_end_handler: function () {
        if (qh_{{ Component['@component_id'] }}.queries == 0) {
            d3.select('#vis_container_{{ Component['@component_id'] }}')
                .style("pointer-events", "auto")
                .selectAll("svg")
                .style("opacity", 1);

            d3.select('#main-loader-{{ Component['@component_id'] }}')
                .style("display", "none");

            d3.select('#loader-{{ Component['@component_id'] }}')
                .style("display", "none");
        }
    }

};