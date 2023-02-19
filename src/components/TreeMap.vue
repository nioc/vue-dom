<template>
  <div class="is-flex">
    <svg ref="svg" height="400" width="100%" />
  </div>
</template>

<script>
import { select } from 'd3-selection'
import { forceSimulation, forceManyBody, forceCenter, forceCollide, forceLink } from 'd3-force'
import { hierarchy } from 'd3-hierarchy'
import { zoom } from 'd3-zoom'

export default {
  name: 'TreeMap',
  props: {
    tree: {
      type: Object,
      required: true,
    },
    isZoomable: {
      type: Boolean,
      default: true,
    },
    linkColorFunction: {
      type: Function,
      default: () => null,
    },
    onClickFunction: {
      type: Function,
      default: () => null,
    },
    onLegendClickFunction: {
      type: Function,
      default: () => null,
    },
    legendClass: {
      type: String,
      default: '',
    },
  },
  data () {
    return {
      scale: null,
      x: null,
      y: null,
    }
  },
  watch: {
    tree: 'render',
  },
  mounted () {
    this.render()
    window.addEventListener('resize', this.render)
  },
  beforeUnmount () {
    window.removeEventListener('resize', this.render)
  },
  methods: {
    render () {
      // initialize
      const svg = select('svg').attr('height', 400)
      svg.selectAll('g').remove()
      const g = svg.append('g')
      const deviceRadius = 30
      const yMargin = 10
      const xMargin = 10

      // handle data
      const root = hierarchy(this.tree)
        .sum(function (d) {
          return d.value
        })
      const links = root.links()
      const nodes = root.descendants()

      // handle zoom
      if (this.isZoomable) {
        svg
          .call(zoom()
            .on('zoom', (event) => {
              g.attr('transform', `translate(${this.scale * this.x + event.transform.x},${this.scale * this.y + event.transform.y}) scale(${this.scale * event.transform.k})`)
            }),
          )
      }

      // applies forces
      forceSimulation(nodes)
        .force('charge', forceManyBody().strength(node => node.data.isParent ? -10000 : -1000))
        .force('link', forceLink(links).distance(link => link.target.data.isParent ? 200 : 140).iterations(10))
        .force('collide', forceCollide(deviceRadius * 1.5).iterations(5))
        .force('center', forceCenter())
        .stop()
        .tick(50)

      // add links
      g.append('g')
        .attr('class', 'tree-link')
        .selectAll('line')
        .data(links)
        .enter().append('line')
        .attr('stroke-dasharray', l => l.target.data.strokeDasharray)
        .attr('stroke', l => this.linkColorFunction(l))
        .attr('x1', l => l.source.x)
        .attr('y1', l => l.source.y)
        .attr('x2', l => l.target.x)
        .attr('y2', l => l.target.y)
        .append('title')
        .text(l => l.target.data.linkText)

      // add links legend
      g.append('g')
        .attr('class', 'tree-link-legend')
        .selectAll('text')
        .data(links)
        .join('text')
        .text(d => d.target.data.linkText)
        .attr('transform', d => {
          return `translate(${(d.source.x + d.target.x) / 2},${(d.source.y + d.target.y) / 2}) rotate(${Math.atan((d.source.y - d.target.y) / (d.source.x - d.target.x)) * 180 / Math.PI}) translate(0,-4)`
        })

      // add nodes circle
      g.append('g')
        .attr('class', 'tree-node-circle is-clickable')
        .selectAll('circle')
        .data(nodes)
        .join('circle')
        .attr('id', d => `node-circle-${d.index}`)
        .attr('stroke', d => d.data.circleColor)
        .attr('stroke-width', d => 3 * d.data.scale)
        .attr('r', d => deviceRadius * d.data.scale)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .on('mouseover', (event, node) => this.tracePath(g, node, root))
        .on('mouseout', () => this.untracePath(g))
        .on('click', (event, node) => this.onClickFunction(node))
        .append('title')
        .text(d => d.data.title)

      // add nodes icon
      g.append('g')
        .attr('class', 'tree-node-icon is-clickable')
        .selectAll('text')
        .data(nodes)
        .join('text')
        .attr('id', d => `node-icon-${d.index}`)
        .text(d => {
          const tempElement = document.createElement('i')
          tempElement.className = d.data.icon
          document.body.appendChild(tempElement)
          const unicodeContent = window.getComputedStyle(tempElement, ':before').content.replace(/'|"/g, '') + ' '
          tempElement.parentNode.removeChild(tempElement)
          return unicodeContent
        })
        .attr('font-size', d => `${28 * d.data.scale}px`)
        .attr('class', d => 'fas ' + d.data.icon)
        .attr('x', d => d.x)
        .attr('y', d => d.y + 10 * d.data.scale)
        .on('mouseover', (event, node) => this.tracePath(g, node, root))
        .on('mouseout', () => this.untracePath(g))
        .on('click', (event, node) => this.onClickFunction(node))
        .append('title')
        .text(d => d.data.title)

      // add nodes legend
      g.append('g')
        .attr('class', `tree-node-legend ${this.legendClass}`)
        .selectAll('text')
        .data(nodes)
        .join('text')
        .attr('id', d => `node-legend-${d.index}`)
        .text(d => d.data.legend)
        .attr('x', d => d.x)
        .attr('y', d => d.y + (deviceRadius + 11) * d.data.scale)
        .on('click', (event, node) => this.onLegendClickFunction(node))

      // set container height with content height
      const contentSize = g.node().getBBox()
      const containerSize = svg.node().getBoundingClientRect()

      // set scale
      let scale = 1
      if (contentSize.width > containerSize.width) {
        scale = containerSize.width / (contentSize.width + xMargin)
      }
      svg
        .attr('height', scale * contentSize.height + yMargin)
      this.scale = scale
      this.x = ((containerSize.width - scale * contentSize.width) / 2 - contentSize.x)
      this.y = yMargin - contentSize.y
      g
        .attr('transform', `scale(${scale}) translate(${((containerSize.width - scale * contentSize.width) / 2 - contentSize.x)}, ${yMargin - contentSize.y})`)
    },
    tracePath (g, node, root) {
      const opacity = 0.2
      let ancestors = node.ancestors()
      let ancestorsId = ancestors.map(node => node.index)
      if (node.data.source) {
        const source = root.find(_node => _node.data.id === node.data.source)
        if (source) {
          ancestors = node.path(source)
          ancestorsId = ancestors
            .map(_node => _node.index)
        }
      }
      const links = []
      ancestors.forEach(a => {
        const ancestorLinks = a.links()
        ancestorLinks.forEach(ancestorLink => {
          if (ancestorsId.includes(ancestorLink.target.index)) {
            links.push({
              source: ancestorLink.source.index,
              target: ancestorLink.target.index,
            })
          }
        })
      })
      g
        .selectAll('circle')
        .filter(d => !ancestorsId.includes(d.index))
        .attr('stroke-opacity', opacity)
      g
        .select('.tree-node-icon')
        .selectAll('text')
        .filter(d => !ancestorsId.includes(d.index))
        .attr('opacity', opacity)
      g
        .select('.tree-node-legend')
        .selectAll('text')
        .filter(d => !ancestorsId.includes(d.index))
        .attr('opacity', opacity)
      g
        .selectAll('line')
        .filter(l => !links.find(link => link.source === l.source.index && link.target === l.target.index))
        .attr('stroke-opacity', '0.08')
      g
        .select('.tree-link-legend')
        .selectAll('text')
        .filter(l => !links.find(link => link.source === l.source.index && link.target === l.target.index))
        .attr('opacity', opacity)
    },
    untracePath (g) {
      g
        .selectAll('circle')
        .attr('stroke-opacity', null)
      g
        .selectAll('text')
        .attr('opacity', null)
      g
        .selectAll('line')
        .attr('stroke-opacity', null)
    },
  },
}
</script>
