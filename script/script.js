var margin = {t:50,r:50,b:50,l:50};
var width = $('.plot').width() - margin.r - margin.l,
    height = $('.plot').height() - margin.t - margin.b;

var plot = d3.select('.plot')
    .append('svg')
    .attr('width',width+margin.r+margin.l)
    .attr('height',height + margin.t + margin.b)
    .append('g')
    .attr('class','plot')
    .attr('transform','translate('+margin.l+','+margin.t+')');

var scaleX = d3.scale.log()
        .range([0,width]),
    scaleY = d3.scale.log()
        .range([height,0]);
    scaleR = d3.scale.linear()
        .range([5,30]);

var axisX = d3.svg.axis()
    .orient('bottom')
    /*.tickValues([1045,4125,12746,40000])*/
    .tickSize(-height,0)
    .scale(scaleX);
var axisY = d3.svg.axis()
    .orient('left')
    .tickSize(-width,0)
    .scale(scaleY);

d3.csv('data/world_bank_2010_gdp_co2.csv',
    function(row) {
        return {
            gdpPerCap: row['GDP per capita, PPP (constant 2011 international $)'] == '..' ? undefined : +row['GDP per capita, PPP (constant 2011 international $)'],
            co2Total: row['CO2 emissions (kt)'] == '..' ? undefined : +row['CO2 emissions (kt)'],
            co2PerCap: row['CO2 emissions (metric tons per capita)'] == '..' ? undefined : +row['CO2 emissions (metric tons per capita)'],
            PopTotal: row['Population, total'] == '..' ? undefined : +row['Population, total'],
            country: row['Country Name'],
            countryCode: row['Country Code']
        }
    },
    function(error,rows){
        console.log("Data loaded");

        var minX = d3.min(rows, function(d){ return d.gdpPerCap; }),
            maxX = d3.max(rows, function(d){ return d.gdpPerCap; });
        var minY = d3.min(rows, function(d){ return d.co2PerCap; }),
            maxY = d3.max(rows, function(d){ return d.co2PerCap; });
        var minR = d3.min(rows, function(d){ return d.PopTotal; }),
            maxR = d3.max(rows, function(d){ return d.PopTotal; });
        scaleX.domain([minX, maxX]);
        scaleY.domain([minY, maxY]);
        scaleR.domain([minR, maxR]);

        plot.append('g')
            .attr('class','axis x')
            .attr('transform','translate(0,'+height+')')
            .call(axisX);
        plot.append('g')
            .attr('class','axis y')
            .call(axisY);

        draw(rows);
    });

function draw(rows) {
    console.log("Start drawing");

    var nodes = plot.selectAll('.node')
        .data(rows)
        .enter()
        .append('g')
        .attr('class', 'node')
        .style('fill',function(d){
            return 'rgb('+  Math.floor(15*(scaleR(d.PopTotal))) +','+ (255-Math.floor(15*(scaleR(d.PopTotal)))) +',0)'
        })
        .filter(function (d) {
            return d.gdpPerCap && d.co2PerCap;
        })
        .attr('transform', function(d) {
            return 'translate(' + scaleX(d.gdpPerCap) + ',' + scaleY(d.co2PerCap) + ')';
        });
        /*.style('fill','rgb(255,0,0)')*/


    nodes.append('circle')
        .attr('r', function(d) {return scaleR(d.PopTotal)});
    nodes.append('text')
        .text(function (d) {
            return d.country;
        })
        .attr('text-anchor', 'middle')
        .attr('dy', 12);
}