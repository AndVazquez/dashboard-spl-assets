/*
 * Query handler in charge of connecting a chord diagram instance with the OEEU's GraphQL API
 */

var qh_{{ Component['@component_id'] }} = {
    viz: null,
    query: {},
    queries: 0,
    metric: 'twoLevelGroupedCount',
    level1: '',
    level2: '',
    edition: '',
    filter: {},
    currentPromise: $.Deferred().resolve().promise(),
    querySchema: function (metricName, l1Code, l2Code, alias) {
        if (metricName == 'twoLevelGroupedCount') {
            var query = alias + ':' + metricName
                + '(level1:"' + l1Code + '", level2:"' + l2Code + '")' +
                '{ descriptionL1, descriptionL2, label, values {label, value}}'
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
    initFilter: function (key, val) {
        this.filter[key] = val;
    },
    initQuery: function (l1code, l2code, alias, edition) {
        var subquery = {'metric': this.metric, 'alias': alias, 'l1code': l1code, 'l2code': l2code, 'edition': edition};
        this.level1 = l1code;
        this.level2 = l2code;
        this.edition = edition;
        this.query['c'] = subquery;
    },
    getCurrentQuery: function () {
        var alias = this.query['c']['alias'];
        var edition = this.edition;

        var query = this.querySchema(this.query['c']['metric'], this.query['c']['l1code'],
            this.query['c']['l2code'], alias);

        var filter_len = Object.keys(this.filter).length;
        if (filter_len != 0)
            var filter = this.filterSchema(this.filter, filter_len);
        else
            var filter = '';

        return 'query { ' + edition + filter + '{' + query + '}}';
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
    setL1Query: function (l1code, alias, edition) {
        this.level1 = l1code;
        var subquery = {
            'metric': this.metric, 'alias': alias, 'l1code': l1code, 'l2code': this.level2,
            'edition': edition
        };
        this.query['c'] = subquery;

        this.buildQuery();
    },
    setL2Query: function (l2code, alias, edition) {
        this.level2 = l2code;
        var subquery = {
            'metric': this.metric, 'alias': alias, 'l1code': this.level1, 'l2code': l2code,
            'edition': edition
        };
        this.query['c'] = subquery;
        this.buildQuery();
    },
    buildQuery: function () {
        var alias = this.query['c']['alias'];
        var edition = this.edition;
        var query = this.querySchema(this.query['c']['metric'],
            this.query['c']['l1code'], this.query['c']['l2code'], this.query['c']['alias']);
        var filter_len = Object.keys(this.filter).length;

        if (filter_len != 0)
            var filter = this.filterSchema(this.filter, filter_len);
        else
            var filter = '';

        var total = 'query { ' + edition + filter + '{' + query + '}}';

        var i_viz = this.viz;
        var queryPromise = $.ajax({
            url: '/api/graphql',
            type: 'POST',
            data: {
                csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').prop('value'),
                query: total
            }
        });

        var thenPromise = this.currentPromise.then(
            function () {
                return queryPromise;
            },
            function () {
                return queryPromise;
            });

        thenPromise.done(function (rs) {
            try {
                i_viz.data(rs['data'][edition][alias]);
            }
            catch (e) {
            }
        });
        thenPromise.fail(function () {
            console.log('Failure');
        });
    }
};