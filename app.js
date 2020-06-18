$(document).ready(function() {
	let myRequest = new Request('https://raw.githubusercontent.com/Seb-Leb/protein_clusters/master/clusters.json');
	fetch(myRequest)
		.then(function(res) {
			return res.json();
		})
		.then(function(clusters) {
			clusters_graph = clusters.clusters_graph;
			node_positions = clusters.node_positions;
			cluster_det = clusters.clusters;

			var cy = cytoscape({
				container: document.getElementById('cy'),
				elements: clusters_graph.elements,
				style: cytoscape.stylesheet()
					.selector('node')
						.style({
							'width' : function(ele){return 10+1.5*ele.data("clust_size")},
							'height': function(ele){return 10+1.5*ele.data("clust_size")}
						})
			});
			cy.nodes('[contains_alt = "yes"]').style('background-color', '#d81159');
			cy.nodes('[contains_alt = "no"]').style('background-color', '#2582c6');
			var layout = cy.layout({
				name:'cose',
				animate: false,
				//positions: function(n) {return node_positions[n.data("name")]},
			});
			layout.run();
			
			cy.nodes().forEach(function(n){
				n.on('click', function(){
					clust_name = 'cluster_'.concat(n.data("name"));
					var cy_clust = cytoscape({
					container: document.getElementById('clust_cy'),
					elements: cluster_det[clust_name].cytoscape.elements,
					style: cytoscape.stylesheet()
						.selector('node')
							.style({
								'label': function(ele){return ele.data("name")},
								"text-valign": "center",
								"text-halign": "center",
							})
					});
					cy_clust.nodes('[tt_type = "alt"]').style('background-color', '#d81159');
					cy_clust.nodes('[tt_type = "ref"]').style('background-color', '#2582c6');
					var clust_layout = cy_clust.layout({name:'cose'});
					clust_layout.run();

					var details_tree = {
										'core' : {
											'data' : [
												{
													'id' : 'GO',
													'text' : 'Gene Ontology',
													'state' : { 'opened' : true, },
													'children' : cluster_det[clust_name].jstree_go_data,
												},
												{
													'id' : 'DisGeNET',
													'text' : 'DisGeNET',
													'state' : { 'opened' : true,},
													'children' : cluster_det[clust_name].jstree_disease_data, 
												}
											]
										}
									};
					$("#Gene_Ontology").jstree("destroy")
					$("#Gene_Ontology").data('jstree', false).empty().jstree(details_tree);

					$('#Gene_Ontology').on("select_node.jstree", function (e, data) {
					  data.instance.toggle_node(data.node);
					});
				});
			});
		});
});