{% import 'templates/j2-templates/js/components/map/macros.js' as functionalities with context %}

function Map() {
    {{ functionalities.variable_definition() }}
    var width = 200,
        height = 200,
        svg, query_handler;
    var comunidades = "{{ static }}js/static-data/comunidades.json";
    var updateDimensions;

    function my(selection) {

        selection.each(function () {
            {{ functionalities.variable_initialization() }}

            var projection = d3.geoConicConformalSpain();

            projection
                .scale([width * 3])
                .translate([width / 2, height / 2]);

            var path = d3.geoPath()
                .projection(projection);

            svg = d3.select(this).append("svg")
                .attr("id", "map_svg")
                .attr("width", width)
                .attr("height", height);

            d3.json(comunidades, function (error, provincias) {
                var land = topojson.feature(provincias, provincias.objects.ESP_adm1);

                svg.selectAll("path")
                    .data(land.features)
                    .enter()
                    .append("path")
                    .attr("d", path)
                    .attr("id", function (d) {
                        return 'id' + d.properties.ID_OEEU;
                    })
                    .style("fill", {{ functionalities.fill("path") }})
                    .on('mousemove', {{ functionalities.mousemove("path") }})
                    .on("mouseover", {{ functionalities.mouseover("path") }})
                    .on('mouseout', {{ functionalities.mouseout("path") }})
                    .on("click", {{ functionalities.click("path") }});

                var enlargeBy = 15;
                var enlargeFn = function (d, i) {
                    if (i == 0) return [d[0] - enlargeBy, d[1] - enlargeBy];
                    if (i == 1) return [d[0] + enlargeBy, d[1] + enlargeBy];
                };

                var bounds = [path.bounds(svg.select("path#id18").data()[0]).map(enlargeFn),
                    path.bounds(svg.select("path#id19").data()[0]).map(enlargeFn)];

                svg.selectAll("rect")
                    .data(bounds)
                    .enter()
                    .append("rect")
                    .attr("x", function (d) {
                        return d[0][0];
                    })
                    .attr("y", function (d) {
                        return d[0][1];
                    })
                    .attr("width", function (d) {
                        return d[1][0] - d[0][0];
                    })
                    .attr("height", function (d) {
                        return d[1][1] - d[0][1];
                    })
                    .style("fill", {{ functionalities.fill("rect") }})
                    .attr("fill-opacity", 0.4)
                    .on('mousemove', {{ functionalities.mousemove('rect') }})
                    .on("mouseover", {{ functionalities.mouseover('rect') }})
                    .on('mouseout', {{ functionalities.mouseout('rect') }})
                    .on('click', {{ functionalities.click('rect') }});
            });

            updateDimensions = function () {
                svg = svg.attr("width", width)
                    .attr("height", height);

                d3.select(svg.node().parentNode)
                    .style("pointer-events", "none")
                    .transition()
                    .duration(1000)
                    .style('width', width + 'px')
                    .style('height', height + 'px');

                projection
                    .scale([width * 3])
                    .translate([width / 2, height / 2]);

                svg.selectAll("path")
                    .transition()
                    .duration(1000)
                    .attr('d', path);

                var enlargeBy = 15;
                var enlargeFn = function (d, i) {
                    if (i == 0) return [d[0] - enlargeBy, d[1] - enlargeBy];
                    if (i == 1) return [d[0] + enlargeBy, d[1] + enlargeBy];
                };

                var bounds = [path.bounds(svg.select("path#id18").data()[0]).map(enlargeFn),
                    path.bounds(svg.select("path#id19").data()[0]).map(enlargeFn)];

                svg.selectAll("rect")
                    .data(bounds)
                    .transition()
                    .duration(1000)
                    .attr("x", function (d) {
                        return d[0][0];
                    })
                    .attr("y", function (d) {
                        return d[0][1];
                    })
                    .attr("width", function (d) {
                        return d[1][0] - d[0][0];
                    })
                    .attr("height", function (d) {
                        return d[1][1] - d[0][1];
                    })
                    .on("end", function () {
                        d3.select(svg.node().parentNode)
                            .style("pointer-events", "auto");
                    });


            };
        });
    }

    my.width = function (value) {
        if (!arguments.length) return width;
        width = value;
        height = value * 0.6;
        if (typeof updateDimensions === 'function') updateDimensions();
        return my;
    };

    my.height = function (value) {
        if (!arguments.length) return height;
        height = value;
        width = value;
        if (typeof updateDimensions === 'function') updateDimensions();
        return my;
    };

    my.reset_filter = function () {
        svg.selectAll("rect")
            .style("fill", fill_color);
        svg.selectAll("path")
            .style("fill", fill_color);
        selected = null;
    };

    my.query_handler = function (qh) {
        if (!arguments.length) return query_handler;
        query_handler = qh;
        return my;
    };

    {{ functionalities.function_definitions() }}

    return my;
}