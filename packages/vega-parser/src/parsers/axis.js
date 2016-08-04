import axisDomain from './guides/axis-domain';
import axisGrid from './guides/axis-grid';
import axisTicks from './guides/axis-ticks';
import axisLabels from './guides/axis-labels';
import axisTitle from './guides/axis-title';
import {encoder, extendEncode} from './guides/encode-util';
import guideGroup from './guides/guide-group';
import {AxisRole} from './marks/roles';
import parseMark from './mark';
import {ref} from '../util';
import {Collect, AxisTicks} from '../transforms';

export default function(spec, scope) {
  var config = scope.config,
      encode = spec.encode || {},
      interactive = !!spec.interactive,
      datum, dataRef, ticksRef, group, axisEncode, children;

  // single-element data source for axis group
  datum = {
    orient: spec.orient,
    domain: spec.domain != null ? !!spec.domain : true,
    grid:   spec.grid != null ? !!spec.grid : false,
    title:  spec.title
  };
  dataRef = ref(scope.add(Collect({}, [datum])));

  // encoding properties for axis group item
  axisEncode = extendEncode({
    update: {
      offset:       encoder(spec.offset || 0),
      titlePadding: encoder(spec.titlePadding || config.axisTitlePadding),
      minExtent:    encoder(spec.minExtent || config.axisMinExtent),
      maxExtent:    encoder(spec.maxExtent || config.axisMaxExtent)
    }
  }, encode.axis);

  // data source for axis ticks
  ticksRef = ref(scope.add(AxisTicks({
    scale:  scope.scaleRef(spec.scale),
    count:  scope.property(spec.count),
    values: scope.property(spec.values),
    formatSpecifier: scope.property(spec.formatSpecifier)
  })));

  // generate axis marks
  children = [
    axisTicks(spec, config, encode.ticks, ticksRef),
    axisLabels(spec, config, encode.labels, ticksRef)
  ];

  // include axis gridlines if requested
  if (datum.grid) {
    children.unshift(axisGrid(spec, config, encode.grid, ticksRef));
  }

  // include axis domain path if requested
  if (datum.domain) {
    children.push(axisDomain(spec, config, encode.domain, dataRef));
  }

  // include axis title if defined
  if (datum.title) {
    children.push(axisTitle(spec, config, encode.title, dataRef));
  }

  // build axis specification
  group = guideGroup(AxisRole, dataRef, interactive, axisEncode, children);

  // parse axis specification
  return parseMark(group, scope);
}