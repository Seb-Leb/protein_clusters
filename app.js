$(document).ready(function() {
	$("#details_tree").jstree();
	let myRequest = new Request('https://raw.githubusercontent.com/Seb-Leb/protein_clusters/master/clusters.json');
	fetch(myRequest)
		.then(function(res) {
			return res.json();
		})
		.then(function(clusters) {
			clusters_graph = clusters.clusters_graph;
			node_positions = clusters.node_positions;
			cluster_det    = clusters.clusters;



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

		    var h = function(tag, attrs, children){
		      var el = document.createElement(tag);

		      Object.keys(attrs).forEach(function(key){
		        var val = attrs[key];

		        el.setAttribute(key, val);
		      });

		      children.forEach(function(child){
		        el.appendChild(child);
		      });

		      return el;
		    };

		    var t = function(text){
		      var el = document.createTextNode(text);
		      return el;
		    };



			cy.nodes().forEach(function(n){
				n.on('click', function(){
					clust_name = 'cluster_'.concat(n.data("name"));
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
					$("#details_tree").jstree("destroy");
					$("#details_tree").data('jstree', false).empty().jstree(details_tree);
					$('#details_tree').on("select_node.jstree", function (e, data) {
					  data.instance.toggle_node(data.node);
					});
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
					var makeTippy = function(node, html){
				      return tippy( node.popperRef(), {
				        html: html,
				        trigger: 'manual',
				        theme: 'light',
				        arrow: true,
				        placement: 'bottom',
				        hideOnClick: false,
				        interactive: true
				      } ).tooltips[0];
				    };

				    var hideTippy = function(node){
					    var tippy = node.data('tippy');
					      if(tippy != null){
					        tippy.hide();
					      }
				    };

				    var hideAllTippies = function(){
				      cy_clust.nodes().forEach(hideTippy);
				    };
					cy_clust.nodes('[tt_type = "alt"]').style('background-color', '#d81159');
					cy_clust.nodes('[tt_type = "ref"]').style('background-color', '#2582c6');
					var clust_layout = cy_clust.layout({name:'cose'});
					clust_layout.run();
					cy_clust.on('tap', function(e){
				      if(e.target === cy_clust){
				        hideAllTippies();
				      }
				    });

				    cy_clust.on('tap', 'edge', function(e){
				      hideAllTippies();
				    });

				    cy_clust.on('zoom pan', function(e){
				      hideAllTippies();
				    });
					cy_clust.nodes().forEach(function(n){
						var $links = [
						{
							name : 'OpenProt',
							url  : n.data('OP_link')
						}
						].map(function(link){
							return h('a', {target:'_blank', href: link.url, 'class':'tip-link'}, [t(link.name)]);
						});

						var tippy = makeTippy(n, h('div', {}, $links))

						n.data('tippy', tippy);
						n.on('click', function(e){
							tippy.show();
							cy_clust.nodes().not(n).forEach(hideTippy);
						});
					});
				});
			});
		});
});