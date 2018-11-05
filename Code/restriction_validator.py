#!/usr/bin/env python
import collections


def check_layout_components(config):
    references_id = []

    if 'RowGroup' in config:
        for r in config['RowGroup']['Row']:
            ids = check_layout_components(r)
            if len(ids) == 1:
                references_id.append(ids[0])
            else:
                references_id.extend(ids)
    if 'ColumnGroup' in config:
        for c in config['ColumnGroup']['Column']:
            ids = check_layout_components(c)
            if len(ids) == 1:
                references_id.append(ids[0])
            else:
                references_id.extend(ids)
    if 'Column' in config:
        references_id.append(config['Column']['Component']['@ref'])
    if 'Row' in config:
        references_id.append(config['Row']['Component']['@ref'])
    if 'Component' in config:
        references_id.append(config['Component']['@ref'])

    return references_id


def restriction_validation(staff_user, spl):
    errors = []
    valid = True

    if 'PageGroup' in spl['Dashboard']['ScreensConfig']:
        for page_config in spl['Dashboard']['ScreensConfig']['PageGroup']['Page']:
            c_ids = []
            component_filters = False
            global_filter = False
            filter_university = False
            map_filter = False
            component_filter_ccaa = False

            if type(page_config['Components']['Component']) != list:
                page_config['Components']['Component'] = [page_config['Components']['Component']]

            for c in page_config['Components']['Component']:
                for _, c_config in c.items():
                    c_ids.append(c_config['@component_id'])
                    if 'Controls' in c_config:
                        if 'DataFilters' in c_config['Controls']:
                            component_filters = True

                            for f, c in c_config['Controls']['DataFilters']['FilterGroup']['DataResource'].items():
                                if type(c) == list:
                                    for i_f in c:
                                        if i_f['FilterCode'] == 'CodigoRUCT':
                                            filter_university = True
                                        if i_f['FilterCode'] == 'CCAAEstudiante':
                                            component_filter_ccaa = True
                                else:
                                    if c['FilterCode'] == 'CodigoRUCT':
                                        filter_university = True
                                    if c['FilterCode'] == 'CCAAEstudiante':
                                        component_filter_ccaa = True

                        if 'Map' in c_config['Controls']:
                            map_filter = True

                        if 'Map' in c_config['Controls'] and c_config['Controls']['@type'] == 'Bar':
                            valid = False
                            errors.append(str(c_config['@component_id']) +
                                          ": You can't add the Map feature to the controls "
                                          "if control's type is set to 'Bar'")

                        if 'CollapseButton' in c_config['Controls'] and c_config['Controls']['@type'] != 'Bar':
                            valid = False
                            errors.append(str(c_config['@component_id']) +
                                          ": You can only add the CollapseButton feature "
                                          "if control's type is set to 'Bar'")

                        if 'DataSelectors' in c_config['Controls']:
                            try:
                                if 'Category' in c_config['Controls']['DataSelectors'] and \
                                                'Category' not in c_config['InitialData']:
                                    valid = False
                                    errors.append(str(c_config['@component_id']) +
                                                  ": You can only have Category DataSelectors if it is "
                                                  "specified in InitialData")
                                if 'Radius' in c_config['Controls']['DataSelectors'] and \
                                                'Radius' not in c_config['InitialData']:
                                    valid = False
                                    errors \
                                        .append(str(c_config['@component_id']) +
                                                ": You can only have Radius DataSelectors "
                                                "if it is specified in InitialData")
                            except:
                                pass

            if 'DataFilter' in page_config:
                global_filter = True

            if map_filter and component_filter_ccaa:
                valid = False
                errors.append("You can only specify one time the students procedence filter (through the Map component "
                              "or the component filters, but not through both)")

            if global_filter and (component_filters or map_filter):
                valid = False
                errors.append("You can only specify global DataFilter if Components aren't using local DataFilters")

            if len(c_ids) != len(set(c_ids)):
                valid = False
                errors.append('There are duplicate component_ids')

            if not staff_user and filter_university:
                valid = False
                errors.append("Filter by university only available for staff users")

            references = check_layout_components(page_config['Layout'])
            compare = lambda x, y: collections.Counter(x) == collections.Counter(y)
            if not compare(references, c_ids):
                valid = False
                errors.append("References in the Layout section are incorrect, check against the Component ids")

    else:
        c_ids = []
        component_filters = False
        global_filter = False
        map_filter = False
        filter_university = False
        component_filter_ccaa = False

        page_config = spl['Dashboard']['ScreensConfig']['Page']

        if type(page_config['Components']['Component']) != list:
            page_config['Components']['Component'] = [page_config['Components']['Component']]
        for c in page_config['Components']['Component']:
            for _, c_config in c.items():
                c_ids.append(c_config['@component_id'])
                if 'Controls' in c_config:
                    if 'DataFilters' in c_config['Controls']:
                        component_filters = True

                        for f, c in c_config['Controls']['DataFilters']['FilterGroup']['DataResource'].items():
                            if type(c) == list:
                                for i_f in c:
                                    if i_f['FilterCode'] == 'CodigoRUCT':
                                        filter_university = True
                                    if i_f['FilterCode'] == 'CCAAEstudiante':
                                        component_filter_ccaa = True
                            else:
                                if c['FilterCode'] == 'CodigoRUCT':
                                    filter_university = True
                                if c['FilterCode'] == 'CCAAEstudiante':
                                    component_filter_ccaa = True

                    if 'Map' in c_config['Controls']:
                        map_filter = True

                    if 'Map' in c_config['Controls'] and c_config['Controls']['@type'] == 'Bar':
                        valid = False
                        errors.append(str(c_config['@component_id']) +
                                      ": You can't add the Map feature to the controls "
                                      "if control's type is set to 'Bar'")

                    if 'CollapseButton' in c_config['Controls'] and c_config['Controls']['@type'] != 'Bar':
                        valid = False
                        errors.append(str(c_config['@component_id']) +
                                      ": You can only add the CollapseButton feature "
                                      "if control's type is set to 'Bar'")

                    if 'DataSelectors' in c_config['Controls']:
                        try:
                            if 'Category' in c_config['Controls']['DataSelectors'] and \
                                            'Category' not in c_config['InitialData']:
                                valid = False
                                errors.append(str(c_config['@component_id']) +
                                              ": You can only have Category DataSelectors if it is "
                                              "specified in InitialData")
                            if 'Radius' in c_config['Controls']['DataSelectors'] and \
                                            'Radius' not in c_config['InitialData']:
                                valid = False
                                errors \
                                    .append(str(c_config['@component_id']) +
                                            ": You can only have Radius DataSelectors "
                                            "if it is specified in InitialData")
                        except:
                            pass

        if 'DataFilter' in page_config:
            global_filter = True

        if map_filter and component_filter_ccaa:
            valid = False
            errors.append("You can only specify one time the students procedence filter (through the Map component "
                          "or the component filters, but not through both)")

        if global_filter and (component_filters or map_filter):
            valid = False
            errors.append("You can only specify global DataFilter if Components aren't using local DataFilters")

        if len(c_ids) != len(set(c_ids)):
            valid = False
            errors.append('There are duplicate component_ids')

        if not staff_user and filter_university:
            valid = False
            errors.append("Filter by university only available for staff users")

        references = check_layout_components(page_config['Layout'])
        compare = lambda x, y: collections.Counter(x) == collections.Counter(y)
        if not compare(references, c_ids):
            valid = False
            errors.append("References in the Layout section are incorrect, check against the Component ids")

    return valid, errors
