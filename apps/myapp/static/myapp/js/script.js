$(document).ready(function() {
  

  $("#get_list").click(function () {
    $.ajax({
      url: 'http://localhost:8000/get_list_ingredients',

      success: function (data) {
        $("#list").append('<table>')
        $("#list").append('<tbody>')
        data.data.forEach(function(element){
          $("#list").append('<tr>')
          $("#list").append('<td>' +element + '</td>')
          $("#list").append('</tr>')
        })
        $("#list").append('</tbody>')
        $("#list").append('</table>')
      }
    })
  })


$("#submit_ingredient").click(function () {
  event.preventDefault();
  $("#list").empty()
  data_to_post = {
    'first_ingredient': $('#first_ingredient').val(),
  }

  $.ajax({
    url: 'http://localhost:8000/get_data',
    method: 'POST',
    data: JSON.stringify(data_to_post),
    dataType: 'json',
    success: function (data) {
      treeData = data.data;

      var margin = { top: 60, right: 120, bottom: 20, left: 120 },
        width = 960 - margin.right - margin.left,
        height = 500 - margin.top - margin.bottom;

      var i = 0,
        duration = 750,
        root;

      var tree = d3.layout.tree()
        .size([height*2, width]);

      var diagonal = d3.svg.diagonal()
        .projection(function (d) { return [d.y, d.x]; });

      var svg = d3.select("body").append("svg")
        .attr("width", (width + margin.right + margin.left)*2)
        .attr("height", (height + margin.top + margin.bottom)*2)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      root = treeData[0];
      root.x0 = height / 2;
      root.y0 = 0;
      // root.children.forEach(collapse)

      update(root);

      d3.select(self.frameElement).style("height", "500px");

      function update(source) {

        // Compute the new tree layout.
        var nodes = tree.nodes(root).reverse(),
          links = tree.links(nodes);

        // Normalize for fixed-depth.
        nodes.forEach(function (d) { d.y = d.depth * 180; });

        // Update the nodes…
        var node = svg.selectAll("g.node")
          .data(nodes, function (d) { return d.id || (d.id = ++i); });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
          .attr("class", "node")
          .attr("transform", function (d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
          .on("click", click);

        nodeEnter.append("circle")
          .attr("r", 1e-6)
          .style("fill", function (d) { return d._children ? "lightsteelblue" : "#fff"; });

        nodeEnter.append("text")
          .attr("x", function (d) { return d.children || d._children ? -13 : 13; })
          .attr("dy", ".35em")
          .attr("text-anchor", function (d) { return d.children || d._children ? "end" : "start"; })
          .text(function (d) { return d.name; })
          .style("fill-opacity", 1e-6);

        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
          .duration(duration)
          .attr("transform", function (d) { return "translate(" + d.y + "," + d.x + ")"; });

        nodeUpdate.select("circle")
          .attr("r", 10)
          .style("fill", function (d) { return d._children ? "lightsteelblue" : "#fff"; });

        nodeUpdate.select("text")
          .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
          .duration(duration)
          .attr("transform", function (d) { return "translate(" + source.y + "," + source.x + ")"; })
          .remove();

        nodeExit.select("circle")
          .attr("r", 1e-6);

        nodeExit.select("text")
          .style("fill-opacity", 1e-6);

        // Update the links…
        var link = svg.selectAll("path.link")
          .data(links, function (d) { return d.target.id; });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
          .attr("class", "link")
          .attr("d", function (d) {
            var o = { x: source.x0, y: source.y0 };
            return diagonal({ source: o, target: o });
          });

        // Transition links to their new position.
        link.transition()
          .duration(duration)
          .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
          .duration(duration)
          .attr("d", function (d) {
            var o = { x: source.x, y: source.y };
            return diagonal({ source: o, target: o });
          })
          .remove();

        // Stash the old positions for transition.
        nodes.forEach(function (d) {
          d.x0 = d.x;
          d.y0 = d.y;
        });
      }

      // Toggle children on click.
      function click(d) {
        if (d.children) {
          d._children = d.children;
          d.children = null;
        } else {
          d.children = d._children;
          d._children = null;
        }
        update(d);

        //Send data about element clicked 
        temp_list = []
        temp_list.push(d.name)
        while (d.parent != undefined) {
          temp_list.push(d.parent.name)
          d = d.parent
        }

        //ajax to append children to clicked ingredient
        $.ajax({
          url: 'http://localhost:8000/update_data',
          method: 'POST',
          data: JSON.stringify(temp_list),
          dataType: 'json',
          success: function (data) {
            ingredient_obj_start = []
            data.data[0].forEach(function (element) {
              ingredient_obj_start.push({ 'name': element, 'childred': [] })
            })
            get_to_level(treeData[0], temp_list, ingredient_obj_start)
            
            update(d);
          }
        })
        //ajax to match recipies of clicked ingredient
        $.ajax({
          url: 'http://localhost:8000/selected_ingredient_data',
          method: 'POST',
          data: JSON.stringify(temp_list),
          dataType: 'json',
          success: function (data) {
            console.log(temp_list)
          },
          error: function(data){
            console.log('error selected_ingredient_data')
            console.log(data)
          }
        })
      }

      function collapse(d) {
        if (d.children) {
          d._children = d.children;
          d._children.forEach(collapse);
          d.children = null;
        }
      }

      function get_to_level(tree, list, ingredient_obj){
        if (list.length == 1){
          return tree.children = ingredient_obj;
        }
        target_value = list.pop();
        target_index = -1;
        tree.children.forEach(function(obj){
          if (obj.name != target_value){
            target_index++;
          }
        })
        return get_to_level(tree.children[target_index], list, ingredient_obj)
      }

      function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
      }


    },
    failure: function () {
      alert('Got an error');
    }
  });
});
//this is change
})