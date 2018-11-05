/*
 * Query handler in charge of connecting a scatter diagram instance with the OEEU's GraphQL API
 */

var qh_{{ Component['@component_id'] }} = {
    viz: null,
    query: {},
    group: '',
    filter: {},
    queries: 0,
    currentPromise: $.Deferred().resolve().promise(),
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
    querySchema: function (metricName, gCode, tCode, alias) {
        if (metricName == 'oneLevelGroupedAverage' ||
            metricName == 'oneLevelGroupedPercentage') {
            {% if Component|check('Controls.GlobalReference') %}
            var query = alias + ':' + metricName
                + '(level1:"' + gCode + '", target:"' + tCode + '")' +
                '{ min, max, description, unit, values {label, target, value}},' +
                'global_' + alias + ':' + metricName
                + '(level1: "GLOBAL", target:"' + tCode + '")' +
                '{ min, max, description, unit, values {label, target, value}}';
            {% else %}
            var query = alias + ':' + metricName
                + '(level1:"' + gCode + '", target:"' + tCode + '")' +
                '{ min, max, description, unit, values {label, target, value}}';
            {% endif %}
        }
        if (metricName == 'oneLevelGroupedCount') {
            {% if Component|check('Controls.GlobalReference') %}
            var query = alias + ':' + metricName
                + '(level1:"' + gCode + '")' +
                '{ description, min, max, values { label, value }},' +
                'global_' + alias + ':' + metricName
                + '(level1: "GLOBAL")' +
                '{ description, min, max, values { label, value }}';
            {% else %}
            var query = alias + ':' + metricName
                + '(level1:"' + gCode + '")' +
                '{ description, min, max, values { label, value }},';
            {% endif %}
        }

        return query;
    },
    newQuery: function (gcode, tcode, metric, alias) {
        return 'query { stats2017 {' + this.querySchema(metric, gcode, tcode, alias) + '}}';
    },
    initFilter: function (key, val) {
        this.filter[key] = val;
    },
    initX: function (code, metric, alias, edition) {
        var subquery = {'metric': metric, 'alias': alias, 'code': code, 'edition': edition};
        this.query['x'] = subquery;
    },
    initY: function (code, metric, alias, edition) {
        var subquery = {'metric': metric, 'alias': alias, 'code': code, 'edition': edition};
        this.query['y'] = subquery;
    },
    initR: function (code, metric, alias, edition) {
        var subquery = {'metric': metric, 'alias': alias, 'code': code, 'edition': edition};
        this.query['r'] = subquery;
    },
    initC: function (code) {
        this.group = code;
    },
    getCurrentQuery: function () {
        var aliasX = this.query['x']['alias'];
        var aliasY = this.query['y']['alias'];
        {% if Component|check('InitialData.Radius') %}
        var aliasR = this.query['r']['alias'];
        {% endif %}

        var editionX = this.query['x']['edition'];
        var editionY = this.query['y']['edition'];
        {% if Component|check('InitialData.Radius') %}
        var editionR = this.query['r']['edition'];
        {% endif %}

        var queryX = this.querySchema(this.query['x']['metric'], this.group,
            this.query['x']['code'], aliasX);
        var queryY = this.querySchema(this.query['y']['metric'], this.group,
            this.query['y']['code'], aliasY);
        {% if Component|check('InitialData.Radius') %}
        var queryR = this.querySchema(this.query['r']['metric'], this.group,
            this.query['r']['code'], aliasR);
        {% endif %}

        var filter_len = Object.keys(this.filter).length;
        if (filter_len != 0)
            var filter = this.filterSchema(this.filter, filter_len);
        else
            var filter = '';

        var query2015 = [];
        var query2017 = [];

        if (editionX == 'stats2015') {
            query2015.push(queryX)
        }
        else if (editionX == 'stats2017') {
            query2017.push(queryX)
        }

        if (editionY == 'stats2015') {
            query2015.push(queryY)
        }
        else if (editionY == 'stats2017') {
            query2017.push(queryY)
        }

        {% if Component|check('InitialData.Radius') %}
        if (editionR == 'stats2015') {
            query2015.push(queryR)
        }
        else if (editionR == 'stats2017') {
            query2017.push(queryR)
        }
        {% endif %}

        var queries2015 = '';
        query2015.forEach(function (element) {
            queries2015 += element + ',';
        });

        var queries2017 = '';
        query2017.forEach(function (element) {
            queries2017 += element + ',';
        });

        var query2015str = '';
        if (query2015.length != 0)
            query2015str = 'stats2015' + filter + '{' + queries2015 + '}';

        var query2017str = '';
        if (query2017.length != 0)
            query2017str = 'stats2017' + filter + '{' + queries2017 + '}';

        return 'query { ' + query2015str + ',' + query2017str + ' }';
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
    setXQuery: function (code, metric, alias, edition) {
        var subquery = {'metric': metric, 'alias': alias, 'code': code, 'edition': edition};
        this.query['x'] = subquery;
        this.buildXQuery(code, metric, alias, edition);
    },
    buildXQuery: function (code, metric, alias, edition) {

        d3.select("#vis_container_{{ Component['@component_id'] }}")
            .style("pointer-events", "none");
        this.queries += 1;
        var query = this.querySchema(metric, this.group, code, alias);
        var filter_len = Object.keys(this.filter).length;

        if (filter_len != 0)
            var filter = this.filterSchema(this.filter, filter_len);
        else
            var filter = '';

        if (edition == 'stats2015') {
            var total = 'query { \
                stats2015' + filter + '{' + query + '}}';
        }
        else if (edition == 'stats2017') {
            var total = 'query { \
                stats2017' + filter + '{' + query + '}}';
        }

        var i_viz = this.viz;
        var xQueryPromise = $.ajax({
            url: '/api/graphql',
            type: 'POST',
            data: {
                csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').prop('value'),
                query: total
            }
        });

        var thenPromise = this.currentPromise.then(
            function () {
                return xQueryPromise;
            },
            function () {
                return xQueryPromise;
            });

        thenPromise.done(function (rs) {
            i_viz.x_max(rs['data'][edition][alias]['max'])
                .x_min(rs['data'][edition][alias]['min'])
                .xData(rs['data'][edition][alias]['values'])
                {% if Component|check('Controls.GlobalReference.xAxis') %}
                .xLineVal(rs['data'][edition]['global_' + alias]['values'][0]['value'])
                {% endif %}
                .xUnit(rs['data'][edition][alias]['unit'])
                .xDescr(rs['data'][edition][alias]['description']);

            qh_{{ Component['@component_id'] }}.queries -= 1;

        });
        thenPromise.fail(function () {
            console.log('Failure');
        });
    },
    setYQuery: function (code, metric, alias, edition) {
        var subquery = {'metric': metric, 'alias': alias, 'code': code, 'edition': edition};
        this.query['y'] = subquery;
        this.buildYQuery(code, metric, alias, edition);
    },
    buildYQuery: function (code, metric, alias, edition) {

        d3.select("#vis_container_{{ Component['@component_id'] }}")
            .style("pointer-events", "none");
        this.queries += 1;
        var query = this.querySchema(metric, this.group, code, alias);
        var filter_len = Object.keys(this.filter).length;

        if (filter_len != 0)
            var filter = this.filterSchema(this.filter, filter_len);
        else
            var filter = '';

        if (edition == 'stats2015') {
            var total = 'query { \
                stats2015' + filter + '{' + query + '}}';
        }
        else if (edition == 'stats2017') {
            var total = 'query { \
                stats2017' + filter + '{' + query + '}}';
        }

        var i_viz = this.viz;
        var yQueryPromise = $.ajax({
            url: '/api/graphql',
            type: 'POST',
            data: {
                csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').prop('value'),
                query: total
            }
        });

        var thenPromise = this.currentPromise.then(
            function () {
                return yQueryPromise;
            },
            function () {
                return yQueryPromise;
            });

        thenPromise.done(function (rs) {
            i_viz.y_max(rs['data'][edition][alias]['max'])
                .y_min(rs['data'][edition][alias]['min'])
                .yData(rs['data'][edition][alias]['values'])
                {% if Component|check('Controls.GlobalReference.yAxis') %}
                .yLineVal(rs['data'][edition]['global_' + alias]['values'][0]['value'])
                {% endif %}
                .yUnit(rs['data'][edition][alias]['unit'])
                .yDescr(rs['data'][edition][alias]['description']);

            qh_{{ Component['@component_id'] }}.queries -= 1;
        });
        thenPromise.fail(function () {
            console.log('Failure');
        });
    },
    setRQuery: function (code, metric, alias, edition) {
        var subquery = {'metric': metric, 'alias': alias, 'code': code, 'edition': edition};
        this.query['r'] = subquery;
        this.buildRQuery(code, metric, alias, edition);
    },
    {% if Component|check('InitialData.Radius') %}
    buildRQuery: function (code, metric, alias, edition) {

        d3.select("#vis_container_{{ Component['@component_id'] }}")
            .style("pointer-events", "none");
        this.queries += 1;
        var query = this.querySchema(metric, this.group, code, alias);
        var filter_len = Object.keys(this.filter).length;

        if (filter_len != 0)
            var filter = this.filterSchema(this.filter, filter_len);
        else
            var filter = '';

        if (edition == 'stats2015') {
            var total = 'query { \
                stats2015' + filter + '{' + query + '}}';
        }
        else if (edition == 'stats2017') {
            var total = 'query { \
                stats2017' + filter + '{' + query + '}}';
        }

        var i_viz = this.viz;
        var rQueryPromise = $.ajax({
            url: '/api/graphql',
            type: 'POST',
            data: {
                csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').prop('value'),
                query: total
            }
        });

        var thenPromise = this.currentPromise.then(
            function () {
                return rQueryPromise;
            },
            function () {
                return rQueryPromise;
            });

        thenPromise.done(function (rs) {
            i_viz.r_max(rs['data'][edition][alias]['max'])
                .r_min(rs['data'][edition][alias]['min'])
                .rData(rs['data'][edition][alias]['values'])
                .rDescr(rs['data'][edition][alias]['description']);

            qh_{{ Component['@component_id'] }}.queries -= 1;
        });
        thenPromise.fail(function () {
            console.log('Failure');
        });
    },
    {% endif %}
    setGroupQuery: function (code, _, _) {
        this.group = code;
        this.buildQuery();
    },
    buildQuery: function () {

        d3.select("#vis_container_{{ Component['@component_id'] }}")
            .style("pointer-events", "none");
        this.queries += 1;

        var aliasX = this.query['x']['alias'];
        var aliasY = this.query['y']['alias'];
        {% if Component|check('InitialData.Radius') %}
        var aliasR = this.query['r']['alias'];
        {% endif %}

        var editionX = this.query['x']['edition'];
        var editionY = this.query['y']['edition'];
        {% if Component|check('InitialData.Radius') %}
        var editionR = this.query['r']['edition'];
        {% endif %}

        var queryX = this.querySchema(this.query['x']['metric'], this.group,
            this.query['x']['code'], aliasX);
        var queryY = this.querySchema(this.query['y']['metric'], this.group,
            this.query['y']['code'], aliasY);

        {% if Component|check('InitialData.Radius') %}
        var queryR = this.querySchema(this.query['r']['metric'], this.group,
            this.query['r']['code'], aliasR);
        {% endif %}

        var filter_len = Object.keys(this.filter).length;
        if (filter_len != 0)
            var filter = this.filterSchema(this.filter, filter_len);
        else
            var filter = '';

        var query2015 = [];
        var query2017 = [];

        if (editionX == 'stats2015') {
            query2015.push(queryX)
        }
        else if (editionX == 'stats2017') {
            query2017.push(queryX)
        }

        if (editionY == 'stats2015') {
            query2015.push(queryY)
        }
        else if (editionY == 'stats2017') {
            query2017.push(queryY)
        }

        {% if Component|check('InitialData.Radius') %}

        if (editionR == 'stats2015') {
            query2015.push(queryR)
        }
        else if (editionR == 'stats2017') {
            query2017.push(queryR)
        }

        {% endif %}

        var queries2015 = '';
        query2015.forEach(function (element) {
            queries2015 += element + ',';
        });

        var queries2017 = '';
        query2017.forEach(function (element) {
            queries2017 += element + ',';
        });

        var query2015str = '';
        if (query2015.length != 0)
            query2015str = 'stats2015' + filter + '{' + queries2015 + '}';

        var query2017str = '';
        if (query2017.length != 0)
            query2017str = 'stats2017' + filter + '{' + queries2017 + '}';

        var total = 'query { ' + query2015str + ',' + query2017str + ' }';

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
            i_viz.x_max(rs['data'][editionX][aliasX]['max'])
                .y_max(rs['data'][editionY][aliasY]['max'])
                .x_min(rs['data'][editionX][aliasX]['min'])
                .y_min(rs['data'][editionY][aliasY]['min'])
                {% if Component|check('InitialData.Radius') %}
                .r_max(rs['data'][editionR][aliasR]['max'])
                .r_min(rs['data'][editionR][aliasR]['min'])
                .rDescr(rs['data'][editionR][aliasR]['description'])
                .data(rs['data'][editionX][aliasX]['values'],
                    rs['data'][editionY][aliasY]['values'],
                    rs['data'][editionR][aliasR]['values'])
                {% else %}
                .data(rs['data'][editionX][aliasX]['values'],
                    rs['data'][editionY][aliasY]['values'])
                {% endif %}
                {% if Component|check('Controls.GlobalReference.yAxis') %}
                .yLineVal(rs['data'][editionY]['global_' + aliasY]['values'][0]['value'])
                {% endif %}
                {% if Component|check('Controls.GlobalReference.xAxis') %}
                .xLineVal(rs['data'][editionX]['global_' + aliasX]['values'][0]['value'])
                {% endif %}
                .xDescr(rs['data'][editionX][aliasX]['description'])
                .xUnit(rs['data'][editionX][aliasX]['unit'])
                .yDescr(rs['data'][editionY][aliasY]['description'])
                .yUnit(rs['data'][editionY][aliasY]['unit']);

            qh_{{ Component['@component_id'] }}.queries -= 1;
        });
        thenPromise.fail(function () {
            console.log('Failure');
        });

    }
};